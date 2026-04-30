import json
import hashlib
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

# Статусы Тинькофф -> наши статусы
STATUS_MAP = {
    "CONFIRMED": "paid",
    "AUTHORIZED": "paid",
    "REJECTED": "failed",
    "CANCELED": "failed",
    "DEADLINE_EXPIRED": "failed",
    "REFUNDED": "refunded",
    "PARTIAL_REFUNDED": "refunded",
}


def verify_token(params: dict, secret_key: str) -> bool:
    """Проверка подписи уведомления от Тинькофф"""
    token = params.get("Token", "")
    filtered = {k: v for k, v in params.items() if k != "Token" and not isinstance(v, (dict, list))}
    filtered["Password"] = secret_key
    sorted_vals = "".join(str(v) for _, v in sorted(filtered.items()))
    expected = hashlib.sha256(sorted_vals.encode("utf-8")).hexdigest()
    return token == expected


def update_payment_status(payment_id: str, status: str):
    """Обновить статус платежа в БД"""
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.appointments SET payment_status = %s, updated_at = NOW() WHERE payment_id = %s",
            (status, payment_id)
        )
        conn.commit()
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Webhook от Тинькофф — обновляет статус оплаты в таблице appointments"""
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    body = json.loads(event.get("body") or "{}")

    secret_key = os.environ.get("TINKOFF_SECRET_KEY", "TinkoffBankTest")
    if not verify_token(body, secret_key):
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Invalid token"})}

    payment_id = str(body.get("PaymentId", ""))
    tinkoff_status = body.get("Status", "")
    our_status = STATUS_MAP.get(tinkoff_status)

    if payment_id and our_status:
        update_payment_status(payment_id, our_status)

    return {"statusCode": 200, "headers": cors_headers, "body": "OK"}
