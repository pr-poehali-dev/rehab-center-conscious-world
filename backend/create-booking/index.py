import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"


def handler(event: dict, context) -> dict:
    """Сохранение заявки на консультацию (имя, телефон, город, услуга, дата, комментарий) в таблицу bookings"""
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
    client_name = body.get("name", "").strip()
    client_phone = body.get("phone", "").strip()
    client_city = body.get("city", "").strip() or None
    service = body.get("service", "").strip() or None
    preferred_date = body.get("date", "").strip() or None
    comment = body.get("comment", "").strip() or None

    if not client_name or not client_phone:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Имя и телефон обязательны"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.bookings
                (client_name, client_phone, client_city, service, preferred_date, comment)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id""",
            (client_name, client_phone, client_city, service, preferred_date, comment)
        )
        booking_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"success": True, "id": booking_id}),
    }
