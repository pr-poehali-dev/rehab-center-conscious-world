import json
import os
import random
import secrets
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

SCHEMA = "t_p7834125_rehab_center_conscio"

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def send_otp_email(to_email: str, code: str):
    smtp_email = os.environ["SMTP_EMAIL"]
    smtp_password = os.environ["SMTP_PASSWORD"]

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{code} — код входа в личный кабинет"
    msg["From"] = f"Осознанный МИР <{smtp_email}>"
    msg["To"] = to_email

    html = f"""
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #1f3340;">
      <h2 style="font-size: 24px; margin-bottom: 8px;">Осознанный <span style="color: #4a8a6f;">МИР</span></h2>
      <p style="color: #7a9aaa; font-size: 14px; margin-bottom: 32px;">Реабилитационный центр</p>
      <p style="font-size: 16px; margin-bottom: 24px;">Ваш код для входа в личный кабинет:</p>
      <div style="background: #f5f0e8; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #1f3340;">{code}</span>
      </div>
      <p style="font-size: 13px; color: #9abacc;">Код действителен 10 минут. Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_string())


def handle_send(body: dict) -> dict:
    email = body.get("email", "").strip().lower()
    if not email or "@" not in email:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Некорректный email"})}

    code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.otp_codes (email, code, expires_at) VALUES (%s, %s, %s)",
            (email, code, expires_at)
        )
        conn.commit()
    finally:
        conn.close()

    send_otp_email(email, code)
    return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"success": True})}


def handle_verify(body: dict) -> dict:
    email = body.get("email", "").strip().lower()
    code = body.get("code", "").strip()

    if not email or not code:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Укажите email и код"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id FROM {SCHEMA}.otp_codes
                WHERE email = %s AND code = %s AND used = FALSE AND expires_at > NOW()
                ORDER BY created_at DESC LIMIT 1""",
            (email, code)
        )
        row = cur.fetchone()
        if not row:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неверный или просроченный код"})}

        otp_id = row[0]
        cur.execute(f"UPDATE {SCHEMA}.otp_codes SET used = TRUE WHERE id = %s", (otp_id,))

        cur.execute(f"SELECT id, name FROM {SCHEMA}.users WHERE email = %s", (email,))
        user = cur.fetchone()
        if user:
            user_id, name = user
        else:
            cur.execute(f"INSERT INTO {SCHEMA}.users (email) VALUES (%s) RETURNING id, name", (email,))
            user_id, name = cur.fetchone()

        token = secrets.token_hex(32)
        expires_at = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (token, user_id, expires_at) VALUES (%s, %s, %s)",
            (token, user_id, expires_at)
        )
        conn.commit()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"success": True, "token": token, "userId": user_id, "name": name, "email": email}),
    }


def handler(event: dict, context) -> dict:
    """Авторизация по email: POST ?action=send {email} — отправить OTP, POST ?action=verify {email, code} — проверить код и получить токен сессии"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "send")
    body = json.loads(event.get("body") or "{}")

    if action == "send":
        return handle_send(body)
    if action == "verify":
        return handle_verify(body)

    return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Unknown action"})}
