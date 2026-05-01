import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

ALLOWED_SPECIALISTS = {"mikhailova", "sokolov", "petrova", "lebedev"}

DONORS = {
    "volkov": {"id": "volkov", "name": "Игорь Волков", "title": "Предприниматель, меценат", "bio": "Основатель строительного холдинга «Новый Горизонт». В 2018 году лично столкнулся с проблемой зависимости в семье и с тех пор активно поддерживает реабилитационные центры по всей России. Убеждён: здоровое общество начинается с каждой здоровой семьи.", "activity": "Финансирование бесплатных программ для малоимущих семей", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/700dc9d6-b3fd-4c82-b93e-008007bfa45e.jpg"},
    "smirnova": {"id": "smirnova", "name": "Наталья Смирнова", "title": "Руководитель НКО «Свет»", "bio": "20 лет работала в системе социальной защиты, после чего основала некоммерческую организацию по поддержке людей в кризисных ситуациях. Автор программы «Второй шанс».", "activity": "Организация групп взаимопомощи и волонтёрских программ", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/9eef39d9-585a-481d-b21b-f3a8ba9f8ae8.jpg"},
    "petrov": {"id": "petrov", "name": "Виктор Петров", "title": "Врач, профессор медицины", "bio": "Профессор кафедры психиатрии, автор более 80 научных работ по лечению зависимостей. После выхода на пенсию полностью посвятил себя благотворительности.", "activity": "Поддержка научных исследований и обучения специалистов", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/43e2afea-174b-48c7-bccf-6d78d44baaca.jpg"},
    "kozlova": {"id": "kozlova", "name": "Анна Козлова", "title": "Социальный предприниматель", "bio": "Создала сеть социальных кафе, где трудоустраивает людей в ремиссии. Сама прошла путь от зависимости до успешного бизнеса.", "activity": "Трудоустройство и социальная адаптация выпускников программ", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/69888c7b-828d-4306-ba40-bddaebfa27e6.jpg"},
    "morozov": {"id": "morozov", "name": "Алексей Морозов", "title": "IT-предприниматель", "bio": "Основатель IT-компании в сфере телемедицины. Разработал мобильное приложение для поддержки людей в ремиссии. Приложение бесплатно для всех выпускников центра.", "activity": "Разработка цифровых инструментов поддержки ремиссии", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/dc07adf0-2f0d-4528-93c2-6ef354b3a13c.jpg"},
}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


# ── REVIEWS ─────────────────────────────────────────────

def get_reviews(specialist_id: str) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id, author_name, rating, text, created_at FROM {SCHEMA}.specialist_reviews WHERE specialist_id = %s ORDER BY created_at DESC", (specialist_id,))
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
        cur.execute(f"INSERT INTO {SCHEMA}.specialist_reviews (specialist_id, author_name, rating, text) VALUES (%s, %s, %s, %s) RETURNING id", (specialist_id, author_name, rating, text))
        review_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()
    return {"success": True, "id": review_id}


# ── FUND ─────────────────────────────────────────────────

def get_leaderboard() -> list:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT donor_id, SUM(amount), COUNT(*) FROM {SCHEMA}.fund_donations GROUP BY donor_id")
        rows = cur.fetchall()
    finally:
        conn.close()
    totals = {r[0]: {"total": float(r[1]), "count": int(r[2])} for r in rows}
    result = []
    for donor in DONORS.values():
        stats = totals.get(donor["id"], {"total": 0.0, "count": 0})
        result.append({**donor, "totalDonated": stats["total"], "donationsCount": stats["count"]})
    result.sort(key=lambda x: x["totalDonated"], reverse=True)
    for i, d in enumerate(result):
        d["rank"] = i + 1
    return result


def add_donation(donor_id: str, amount: float) -> dict:
    if donor_id not in DONORS:
        return {"error": "Донор не найден"}
    if amount <= 0 or amount > 10_000_000:
        return {"error": "Некорректная сумма"}
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.fund_donations (donor_id, amount) VALUES (%s, %s) RETURNING id", (donor_id, amount))
        donation_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()
    return {"success": True, "id": donation_id}


# ── HANDLER ──────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Социальный API: отзывы специалистов и фонд. ?section=reviews или ?section=fund"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    section = params.get("section", "reviews")

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
            status = 400 if "error" in result else 200
            return {"statusCode": status, "headers": cors_headers, "body": json.dumps(result)}

    if section == "fund":
        if method == "GET":
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"donors": get_leaderboard()})}
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            amount = body.get("amount", 0)
            if not isinstance(amount, (int, float)):
                return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Некорректная сумма"})}
            result = add_donation(body.get("donorId", ""), float(amount))
            status = 400 if "error" in result else 200
            return {"statusCode": status, "headers": cors_headers, "body": json.dumps(result)}

    return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Unknown section"})}
