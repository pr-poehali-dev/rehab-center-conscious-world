import json
import os
import secrets
import hashlib
import psycopg2
from datetime import datetime, timedelta

SCHEMA = "t_p7834125_rehab_center_conscio"

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def make_session(cur, user_id: int) -> str:
    token = secrets.token_hex(32)
    expires_at = datetime.utcnow() + timedelta(days=30)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id, expires_at) VALUES (%s, %s, %s)",
        (token, user_id, expires_at)
    )
    return token


def handle_register(body: dict) -> dict:
    """Регистрация: {name, email, password}"""
    name = body.get("name", "").strip()
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not name:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Введите имя"})}
    if not email or "@" not in email:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Некорректный email"})}
    if len(password) < 6:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Пароль должен быть не короче 6 символов"})}

    pw_hash = hash_password(password)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
        if cur.fetchone():
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Этот email уже зарегистрирован"})}

        cur.execute(
            f"INSERT INTO {SCHEMA}.users (email, name, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (email, name, pw_hash)
        )
        user_id = cur.fetchone()[0]
        token = make_session(cur, user_id)
        conn.commit()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"success": True, "token": token, "userId": user_id, "name": name, "email": email}),
    }


def handle_login(body: dict) -> dict:
    """Вход: {email, password}"""
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Введите email и пароль"})}

    pw_hash = hash_password(password)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
            (email, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неверный email или пароль"})}

        user_id, name = row
        token = make_session(cur, user_id)
        conn.commit()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"success": True, "token": token, "userId": user_id, "name": name, "email": email}),
    }


def handler(event: dict, context) -> dict:
    """Авторизация: POST ?action=register {name, email, password} — регистрация, POST ?action=login {email, password} — вход"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "login")
    body = json.loads(event.get("body") or "{}")

    if action == "register":
        return handle_register(body)
    if action == "login":
        return handle_login(body)

    return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Unknown action"})}
