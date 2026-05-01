import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

DONORS = {
    "volkov": {
        "id": "volkov",
        "name": "Игорь Волков",
        "title": "Предприниматель, меценат",
        "bio": "Основатель строительного холдинга «Новый Горизонт». В 2018 году лично столкнулся с проблемой зависимости в семье и с тех пор активно поддерживает реабилитационные центры по всей России. Убеждён: здоровое общество начинается с каждой здоровой семьи.",
        "activity": "Финансирование бесплатных программ для малоимущих семей",
        "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/700dc9d6-b3fd-4c82-b93e-008007bfa45e.jpg",
    },
    "smirnova": {
        "id": "smirnova",
        "name": "Наталья Смирнова",
        "title": "Руководитель НКО «Свет»",
        "bio": "20 лет работала в системе социальной защиты, после чего основала некоммерческую организацию по поддержке людей в кризисных ситуациях. Автор программы «Второй шанс» — бесплатной психологической помощи для тех, кто не может позволить себе терапию.",
        "activity": "Организация групп взаимопомощи и волонтёрских программ",
        "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/9eef39d9-585a-481d-b21b-f3a8ba9f8ae8.jpg",
    },
    "petrov": {
        "id": "petrov",
        "name": "Виктор Петров",
        "title": "Врач, профессор медицины",
        "bio": "Профессор кафедры психиатрии, автор более 80 научных работ по лечению зависимостей. После выхода на пенсию полностью посвятил себя благотворительности — финансирует исследования и обучение молодых специалистов в регионах.",
        "activity": "Поддержка научных исследований и обучения специалистов",
        "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/43e2afea-174b-48c7-bccf-6d78d44baaca.jpg",
    },
    "kozlova": {
        "id": "kozlova",
        "name": "Анна Козлова",
        "title": "Социальный предприниматель",
        "bio": "Создала сеть социальных кафе, где трудоустраивает людей в ремиссии. Выпускница программы восстановления 2015 года — сама прошла путь от зависимости до успешного бизнеса. Её история вдохновила тысячи людей не сдаваться.",
        "activity": "Трудоустройство и социальная адаптация выпускников программ",
        "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/69888c7b-828d-4306-ba40-bddaebfa27e6.jpg",
    },
    "morozov": {
        "id": "morozov",
        "name": "Алексей Морозов",
        "title": "IT-предприниматель",
        "bio": "Основатель IT-компании в сфере телемедицины. Разработал и профинансировал мобильное приложение для поддержки людей в ремиссии — ежедневные практики, трекер состояния и связь с психологом онлайн. Приложение бесплатно для всех выпускников центра.",
        "activity": "Разработка цифровых инструментов поддержки ремиссии",
        "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/dc07adf0-2f0d-4528-93c2-6ef354b3a13c.jpg",
    },
}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_leaderboard() -> list:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT donor_id, SUM(amount) as total, COUNT(*) as donations_count
                FROM {SCHEMA}.fund_donations
                GROUP BY donor_id"""
        )
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
        cur.execute(
            f"INSERT INTO {SCHEMA}.fund_donations (donor_id, amount) VALUES (%s, %s) RETURNING id",
            (donor_id, amount)
        )
        donation_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    return {"success": True, "id": donation_id}


def handler(event: dict, context) -> dict:
    """Рейтинг благотворительного фонда: GET — список участников с суммами, POST — добавить пожертвование {donorId, amount}"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        leaderboard = get_leaderboard()
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"donors": leaderboard})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        donor_id = body.get("donorId", "")
        amount = body.get("amount", 0)
        if not isinstance(amount, (int, float)):
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Некорректная сумма"})}
        result = add_donation(donor_id, float(amount))
        if "error" in result:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps(result)}
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(result)}

    return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}
