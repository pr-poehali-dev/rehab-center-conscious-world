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


def handler(event: dict, context) -> dict:
    """Получение списка всех заявок на консультацию из таблицы bookings для страницы администратора"""
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id, client_name, client_phone, client_city, service, preferred_date, comment, created_at
                FROM {SCHEMA}.bookings
                ORDER BY created_at DESC
                LIMIT 200"""
        )
        rows = cur.fetchall()
    finally:
        conn.close()

    bookings = []
    for row in rows:
        bookings.append({
            "id": row[0],
            "name": row[1],
            "phone": row[2],
            "city": row[3] or "—",
            "service": SERVICE_LABELS.get(row[4], row[4]) if row[4] else "—",
            "date": str(row[5]) if row[5] else "—",
            "comment": row[6] or "",
            "created_at": row[7].strftime("%d.%m.%Y %H:%M") if row[7] else "",
        })

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"bookings": bookings, "total": len(bookings)}),
    }
