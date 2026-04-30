import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

ALLOWED_SPECIALISTS = {"mikhailova", "sokolov", "petrova", "lebedev"}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_reviews(specialist_id: str) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id, author_name, rating, text, created_at
                FROM {SCHEMA}.specialist_reviews
                WHERE specialist_id = %s
                ORDER BY created_at DESC""",
            (specialist_id,)
        )
        rows = cur.fetchall()
        cur.execute(
            f"SELECT AVG(rating), COUNT(*) FROM {SCHEMA}.specialist_reviews WHERE specialist_id = %s",
            (specialist_id,)
        )
        agg = cur.fetchone()
    finally:
        conn.close()

    reviews = [
        {
            "id": r[0],
            "author": r[1],
            "rating": r[2],
            "text": r[3],
            "date": r[4].strftime("%d.%m.%Y") if r[4] else "",
        }
        for r in rows
    ]
    avg_rating = round(float(agg[0]), 1) if agg[0] else None
    count = agg[1] if agg[1] else 0

    return {"reviews": reviews, "avgRating": avg_rating, "count": count}


def add_review(specialist_id: str, body: dict) -> dict:
    author_name = body.get("authorName", "").strip()
    rating = body.get("rating")
    text = body.get("text", "").strip()

    if not author_name or not text:
        return {"error": "Имя и текст обязательны"}
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return {"error": "Рейтинг должен быть от 1 до 5"}
    if len(text) < 10:
        return {"error": "Отзыв слишком короткий"}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.specialist_reviews (specialist_id, author_name, rating, text)
                VALUES (%s, %s, %s, %s) RETURNING id""",
            (specialist_id, author_name, rating, text)
        )
        review_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    return {"success": True, "id": review_id}


def handler(event: dict, context) -> dict:
    """Получение и добавление отзывов о специалистах центра. GET ?specialist_id=xxx, POST с телом {specialistId, authorName, rating, text}"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        params = event.get("queryStringParameters") or {}
        specialist_id = params.get("specialist_id", "")
        if specialist_id not in ALLOWED_SPECIALISTS:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неизвестный специалист"})}
        result = get_reviews(specialist_id)
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(result)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        specialist_id = body.get("specialistId", "")
        if specialist_id not in ALLOWED_SPECIALISTS:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неизвестный специалист"})}
        result = add_review(specialist_id, body)
        if "error" in result:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps(result)}
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(result)}

    return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}
