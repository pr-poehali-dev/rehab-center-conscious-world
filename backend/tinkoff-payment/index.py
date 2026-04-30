import json
import hashlib
import os
import uuid
import urllib.request
import psycopg2

TINKOFF_API = "https://securepay.tinkoff.ru/v2"
SCHEMA = "t_p7834125_rehab_center_conscio"

# Маппинг метода оплаты на Route для Тинькофф
PAYMENT_ROUTES = {
    "sbp": "FASTER_PAYMENT",   # СБП
    "mir": "MIR_PAY",          # МИР Pay
    "card": None,              # Обычная карта — без ограничений
}


def generate_token(params: dict, secret_key: str) -> str:
    """Генерация токена для подписи запроса к Тинькофф"""
    filtered = {k: v for k, v in params.items() if k != "Token" and k != "Receipt" and not isinstance(v, (dict, list))}
    filtered["Password"] = secret_key
    sorted_vals = "".join(str(v) for _, v in sorted(filtered.items()))
    return hashlib.sha256(sorted_vals.encode("utf-8")).hexdigest()


def tinkoff_request(method: str, payload: dict) -> dict:
    """Выполнить запрос к API Тинькофф"""
    url = f"{TINKOFF_API}/{method}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def save_appointment(client_name, client_phone, client_email, service_name, service_amount, payment_method, payment_id, order_id):
    """Сохранить запись клиента в базу данных"""
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.appointments
                (client_name, client_phone, client_email, service_name, service_amount, payment_method, payment_id, order_id, payment_status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')""",
            (client_name, client_phone, client_email or None, service_name, service_amount, payment_method, str(payment_id), order_id)
        )
        conn.commit()
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Создание платежа через Тинькофф Эквайринг с сохранением записи клиента в БД. Поддерживаются методы: card, sbp, mir"""
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    item_name = body.get("itemName", "Услуга")
    amount_rub = int(body.get("amount", 0))
    customer_name = body.get("customerName", "")
    customer_email = body.get("customerEmail", "")
    customer_phone = body.get("customerPhone", "")
    payment_method = body.get("paymentMethod", "card")  # card | sbp | mir

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
        "DATA": {
            "Name": customer_name,
            "Phone": customer_phone,
        },
    }

    # Указываем метод оплаты через Route
    route = PAYMENT_ROUTES.get(payment_method)
    if route:
        payload["Route"] = route

    if customer_email:
        payload["DATA"]["Email"] = customer_email
        payload["Receipt"] = {
            "Email": customer_email,
            "Taxation": "usn_income",
            "Items": [{
                "Name": item_name,
                "Price": amount_kopecks,
                "Quantity": 1.0,
                "Amount": amount_kopecks,
                "PaymentMethod": "full_prepayment",
                "PaymentObject": "service",
                "Tax": "none",
            }],
        }

    payload["Token"] = generate_token(payload, secret_key)

    result = tinkoff_request("Init", payload)

    if result.get("Success"):
        save_appointment(
            client_name=customer_name,
            client_phone=customer_phone,
            client_email=customer_email,
            service_name=item_name,
            service_amount=amount_rub,
            payment_method=payment_method,
            payment_id=result["PaymentId"],
            order_id=order_id,
        )
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "paymentUrl": result["PaymentURL"],
                "paymentId": result["PaymentId"],
                "orderId": order_id,
            }),
        }

    return {
        "statusCode": 400,
        "headers": cors_headers,
        "body": json.dumps({"error": result.get("Message", "Ошибка создания платежа")}),
    }