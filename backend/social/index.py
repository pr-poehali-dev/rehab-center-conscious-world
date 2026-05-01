import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

ALLOWED_SPECIALISTS = {"mikhailova", "sokolov", "petrova", "lebedev"}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


# ── AUTH ──────────────────────────────────────────────────

def get_user_from_token(token: str):
    if not token:
        return None
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id, u.name, u.email, u.avatar_url
                FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        return cur.fetchone()
    finally:
        conn.close()


# ── REVIEWS ───────────────────────────────────────────────

def get_reviews(specialist_id: str) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, author_name, rating, text, created_at FROM {SCHEMA}.specialist_reviews WHERE specialist_id = %s ORDER BY created_at DESC",
            (specialist_id,)
        )
        rows = cur.fetchall()
        cur.execute(f"SELECT AVG(rating), COUNT(*) FROM {SCHEMA}.specialist_reviews WHERE specialist_id = %s", (specialist_id,))
        agg = cur.fetchone()
    finally:
        conn.close()
    reviews = [{"id": r[0], "author": r[1], "rating": r[2], "text": r[3], "date": r[4].strftime("%d.%m.%Y") if r[4] else ""} for r in rows]
    return {"reviews": reviews, "avgRating": round(float(agg[0]), 1) if agg[0] else None, "count": agg[1] or 0}


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
            f"INSERT INTO {SCHEMA}.specialist_reviews (specialist_id, author_name, rating, text) VALUES (%s, %s, %s, %s) RETURNING id",
            (specialist_id, author_name, rating, text)
        )
        review_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()
    return {"success": True, "id": review_id}


# ── FUND ──────────────────────────────────────────────────

def get_leaderboard() -> list:
    """Рейтинг из реальных пользователей + фиксированные меценаты без взносов не показываются"""
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT d.user_id, u.name, u.email, u.avatar_url,
                       SUM(d.amount) as total, COUNT(*) as cnt
                FROM {SCHEMA}.fund_donations d
                JOIN {SCHEMA}.users u ON u.id = d.user_id
                WHERE d.user_id IS NOT NULL
                GROUP BY d.user_id, u.name, u.email, u.avatar_url
                ORDER BY total DESC"""
        )
        user_rows = cur.fetchall()
    finally:
        conn.close()

    result = []
    for i, r in enumerate(user_rows):
        user_id, name, email, avatar_url, total, cnt = r
        display_name = name or email.split("@")[0]
        result.append({
            "id": str(user_id),
            "name": display_name,
            "title": "Участник фонда",
            "bio": "",
            "activity": "",
            "photo": avatar_url or "",
            "totalDonated": float(total),
            "donationsCount": int(cnt),
            "rank": i + 1,
            "isUser": True,
        })

    return result


def add_donation(user_id: int, amount: float) -> dict:
    if amount <= 0 or amount > 10_000_000:
        return {"error": "Некорректная сумма"}
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.fund_donations (donor_id, amount, user_id) VALUES (%s, %s, %s) RETURNING id",
            (str(user_id), amount, user_id)
        )
        donation_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()
    return {"success": True, "id": donation_id}


# ── HANDLER ───────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Социальный API: отзывы (?section=reviews) и фонд (?section=fund). Взнос требует X-Authorization."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    section = params.get("section", "reviews")
    headers = event.get("headers") or {}

    if section == "reviews":
        if method == "GET":
            sp_id = params.get("specialist_id", "")
            if sp_id not in ALLOWED_SPECIALISTS:
                return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неизвестный специалист"})}
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(get_reviews(sp_id))}
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            sp_id = body.get("specialistId", "")
            if sp_id not in ALLOWED_SPECIALISTS:
                return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Неизвестный специалист"})}
            result = add_review(sp_id, body)
            return {"statusCode": 400 if "error" in result else 200, "headers": cors_headers, "body": json.dumps(result)}

    if section == "fund":
        if method == "GET":
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"donors": get_leaderboard()})}

        if method == "POST":
            auth = headers.get("X-Authorization") or headers.get("x-authorization") or ""
            token = auth.replace("Bearer ", "").strip()
            user = get_user_from_token(token)
            if not user:
                return {"statusCode": 401, "headers": cors_headers, "body": json.dumps({"error": "Необходима авторизация"})}
            body = json.loads(event.get("body") or "{}")
            amount = body.get("amount", 0)
            if not isinstance(amount, (int, float)) or amount <= 0:
                return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Введите сумму"})}
            result = add_donation(user[0], float(amount))
            return {"statusCode": 400 if "error" in result else 200, "headers": cors_headers, "body": json.dumps(result)}

    return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Unknown section"})}
