import json
import hashlib
import os
import uuid
import urllib.request
import psycopg2

TINKOFF_API = "https://securepay.tinkoff.ru/v2"
SCHEMA = "t_p7834125_rehab_center_conscio"

PAYMENT_ROUTES = {
    "sbp": "FASTER_PAYMENT",
    "mir": "MIR_PAY",
    "card": None,
}

STATUS_MAP = {
    "CONFIRMED": "paid",
    "AUTHORIZED": "paid",
    "REJECTED": "failed",
    "CANCELED": "failed",
    "DEADLINE_EXPIRED": "failed",
    "REFUNDED": "refunded",
    "PARTIAL_REFUNDED": "refunded",
}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def generate_token(params: dict, secret_key: str) -> str:
    filtered = {k: v for k, v in params.items() if k != "Token" and k != "Receipt" and not isinstance(v, (dict, list))}
    filtered["Password"] = secret_key
    sorted_vals = "".join(str(v) for _, v in sorted(filtered.items()))
    return hashlib.sha256(sorted_vals.encode("utf-8")).hexdigest()


def verify_token(params: dict, secret_key: str) -> bool:
    token = params.get("Token", "")
    filtered = {k: v for k, v in params.items() if k != "Token" and not isinstance(v, (dict, list))}
    filtered["Password"] = secret_key
    sorted_vals = "".join(str(v) for _, v in sorted(filtered.items()))
    return token == hashlib.sha256(sorted_vals.encode("utf-8")).hexdigest()


def tinkoff_request(method: str, payload: dict) -> dict:
    url = f"{TINKOFF_API}/{method}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def handle_payment(body: dict) -> dict:
    item_name = body.get("itemName", "Услуга")
    amount_rub = int(body.get("amount", 0))
    customer_name = body.get("customerName", "")
    customer_email = body.get("customerEmail", "")
    customer_phone = body.get("customerPhone", "")
    payment_method = body.get("paymentMethod", "card")

    if amount_rub <= 0:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Некорректная сумма"})}

    terminal_key = os.environ.get("TINKOFF_TERMINAL_KEY", "TinkoffBankTest")
    secret_key = os.environ.get("TINKOFF_SECRET_KEY", "TinkoffBankTest")
    order_id = str(uuid.uuid4())[:16]
    amount_kopecks = amount_rub * 100

    payload = {
        "TerminalKey": terminal_key,
        "Amount": amount_kopecks,
        "OrderId": order_id,
        "Description": item_name,
        "DATA": {"Name": customer_name, "Phone": customer_phone},
    }

    route = PAYMENT_ROUTES.get(payment_method)
    if route:
        payload["Route"] = route

    if customer_email:
        payload["DATA"]["Email"] = customer_email
        payload["Receipt"] = {
            "Email": customer_email,
            "Taxation": "usn_income",
            "Items": [{
                "Name": item_name, "Price": amount_kopecks, "Quantity": 1.0,
                "Amount": amount_kopecks, "PaymentMethod": "full_prepayment",
                "PaymentObject": "service", "Tax": "none",
            }],
        }

    payload["Token"] = generate_token(payload, secret_key)
    result = tinkoff_request("Init", payload)

    if result.get("Success"):
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()
            cur.execute(
                f"""INSERT INTO {SCHEMA}.appointments
                    (client_name, client_phone, client_email, service_name, service_amount, payment_method, payment_id, order_id, payment_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')""",
                (customer_name, customer_phone, customer_email or None, item_name,
                 amount_rub, payment_method, str(result["PaymentId"]), order_id)
            )
            conn.commit()
        finally:
            conn.close()
        return {"statusCode": 200, "headers": cors_headers,
                "body": json.dumps({"paymentUrl": result["PaymentURL"], "paymentId": result["PaymentId"], "orderId": order_id})}

    return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": result.get("Message", "Ошибка")})}


def handle_webhook(body: dict) -> dict:
    secret_key = os.environ.get("TINKOFF_SECRET_KEY", "TinkoffBankTest")
    if not verify_token(body, secret_key):
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Invalid token"})}

    payment_id = str(body.get("PaymentId", ""))
    our_status = STATUS_MAP.get(body.get("Status", ""))

    if payment_id and our_status:
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.appointments SET payment_status = %s, updated_at = NOW() WHERE payment_id = %s",
                (our_status, payment_id)
            )
            conn.commit()
        finally:
            conn.close()

    return {"statusCode": 200, "headers": cors_headers, "body": "OK"}


def handler(event: dict, context) -> dict:
    """Тинькофф Эквайринг: POST ?action=pay — создать платёж, POST ?action=webhook — webhook от банка"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "pay")
    body = json.loads(event.get("body") or "{}")

    if action == "webhook":
        return handle_webhook(body)
    return handle_payment(body)
