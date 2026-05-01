import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

SERVICE_LABELS = {
    "psychotherapy": "Психотерапия",
    "rehab": "Реабилитация",
    "group": "Групповая терапия",
    "family": "Семейная терапия",
    "art": "Арт-терапия",
    "other": "Хочу посоветоваться",
}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


def get_user_id_from_token(token: str):
    if not token:
        return None
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Заявки на консультацию: GET — список всех заявок (для админа), POST — создать заявку {name, phone, city, service, date, comment}"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()
            cur.execute(
                f"""SELECT id, client_name, client_phone, client_city, service, preferred_date, comment, created_at, status
                    FROM {SCHEMA}.bookings
                    ORDER BY created_at DESC
                    LIMIT 200"""
            )
            rows = cur.fetchall()
        finally:
            conn.close()

        bookings = [
            {
                "id": r[0],
                "name": r[1],
                "phone": r[2],
                "city": r[3] or "—",
                "service": SERVICE_LABELS.get(r[4], r[4]) if r[4] else "—",
                "date": str(r[5]) if r[5] else "—",
                "comment": r[6] or "",
                "created_at": r[7].strftime("%d.%m.%Y %H:%M") if r[7] else "",
                "status": r[8] or "new",
            }
            for r in rows
        ]
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"bookings": bookings, "total": len(bookings)})}

    if method == "PUT":
        body = json.loads(event.get("body") or "{}")
        booking_id = body.get("id")
        status = body.get("status", "confirmed")
        allowed = {"new", "confirmed", "completed", "cancelled"}
        if not booking_id or status not in allowed:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Некорректные данные"})}
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.bookings SET status = %s WHERE id = %s", (status, booking_id))
            conn.commit()
        finally:
            conn.close()
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"success": True})}

    if method == "POST":
        headers = event.get("headers") or {}
        auth = headers.get("X-Authorization") or headers.get("x-authorization") or ""
        token = auth.replace("Bearer ", "").strip()
        user_id = get_user_id_from_token(token)

        body = json.loads(event.get("body") or "{}")
        client_name = body.get("name", "").strip()
        client_phone = body.get("phone", "").strip()
        if not client_name or not client_phone:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Имя и телефон обязательны"})}

        client_city = body.get("city", "").strip() or None
        service = body.get("service", "").strip() or None
        preferred_date = body.get("date", "").strip() or None
        comment = body.get("comment", "").strip() or None

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        try:
            cur = conn.cursor()
            cur.execute(
                f"""INSERT INTO {SCHEMA}.bookings
                    (client_name, client_phone, client_city, service, preferred_date, comment, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (client_name, client_phone, client_city, service, preferred_date, comment, user_id)
            )
            booking_id = cur.fetchone()[0]
            conn.commit()
        finally:
            conn.close()

        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"success": True, "id": booking_id})}

    return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}