import json
import os
import psycopg2

SCHEMA = "t_p7834125_rehab_center_conscio"

SPECIALISTS_DATA = {
    "sokolov": {"name": "Андрей Соколов", "role": "Нарколог-психиатр", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/200bb38d-6823-43e3-842b-e29e8e0a5760.jpg"},
    "mikhailova": {"name": "Елена Михайлова", "role": "Психотерапевт, КПТ", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/eafe621e-ce97-4b24-a374-54c22fe788da.jpg"},
    "petrova": {"name": "Ольга Петрова", "role": "Гештальт-терапевт", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/8d8088eb-1e9e-475b-a839-4d4dcc6ab0f7.jpg"},
    "lebedev": {"name": "Дмитрий Лебедев", "role": "Семейный психолог", "photo": "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/c5cfd892-b72f-475d-9885-e01c519494bf.jpg"},
}

cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


def get_user_from_token(token: str):
    if not token:
        return None
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id, u.email, u.name FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        return cur.fetchone()
    finally:
        conn.close()


def get_profile(user_id: int, email: str, name: str) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()

        cur.execute(
            f"""SELECT specialist_id, created_at FROM {SCHEMA}.favorites
                WHERE user_id = %s ORDER BY created_at DESC""",
            (user_id,)
        )
        fav_rows = cur.fetchall()
        favorites = [
            {
                "specialistId": r[0],
                "name": SPECIALISTS_DATA.get(r[0], {}).get("name", r[0]),
                "role": SPECIALISTS_DATA.get(r[0], {}).get("role", ""),
                "photo": SPECIALISTS_DATA.get(r[0], {}).get("photo", ""),
                "addedAt": r[1].strftime("%d.%m.%Y") if r[1] else "",
            }
            for r in fav_rows
        ]

        cur.execute(
            f"""SELECT amount, donated_at FROM {SCHEMA}.fund_donations
                WHERE donor_id = %s ORDER BY donated_at DESC LIMIT 10""",
            (str(user_id),)
        )
        donations = [
            {"amount": float(r[0]), "date": r[1].strftime("%d.%m.%Y %H:%M") if r[1] else ""}
            for r in cur.fetchall()
        ]

    finally:
        conn.close()

    return {
        "userId": user_id,
        "email": email,
        "name": name,
        "favorites": favorites,
        "donations": donations,
        "bookings": [],
    }


def add_favorite(user_id: int, specialist_id: str) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.favorites (user_id, specialist_id) VALUES (%s, %s) ON CONFLICT (user_id, specialist_id) DO NOTHING",
            (user_id, specialist_id)
        )
        conn.commit()
    finally:
        conn.close()
    return {"success": True, "added": True}


def update_name(user_id: int, name: str) -> dict:
    name = name.strip()
    if not name:
        return {"error": "Имя не может быть пустым"}
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET name = %s WHERE id = %s", (name, user_id))
        conn.commit()
    finally:
        conn.close()
    return {"success": True}


def handler(event: dict, context) -> dict:
    """Личный кабинет: GET — профиль (избранное, пожертвования), POST ?action=add-fav|remove-fav {specialistId}, PUT {name}. Требует X-Authorization: Bearer TOKEN"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    headers = event.get("headers") or {}
    auth = headers.get("X-Authorization") or headers.get("x-authorization") or ""
    token = auth.replace("Bearer ", "").strip()
    user = get_user_from_token(token)

    if not user:
        return {"statusCode": 401, "headers": cors_headers, "body": json.dumps({"error": "Необходима авторизация"})}

    user_id, email, name = user
    method = event.get("httpMethod", "GET")

    if method == "GET":
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(get_profile(user_id, email, name))}

    if method == "POST":
        params = event.get("queryStringParameters") or {}
        action = params.get("action", "")
        body = json.loads(event.get("body") or "{}")
        sp_id = body.get("specialistId", "")

        if action == "add-fav":
            if sp_id not in SPECIALISTS_DATA:
                return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Специалист не найден"})}
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(add_favorite(user_id, sp_id))}

        if action == "remove-fav":
            conn = psycopg2.connect(os.environ["DATABASE_URL"])
            try:
                cur = conn.cursor()
                cur.execute(
                    f"UPDATE {SCHEMA}.favorites SET specialist_id = specialist_id WHERE user_id = %s AND specialist_id = %s AND FALSE",
                    (user_id, sp_id)
                )
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.favorites WHERE user_id = %s AND specialist_id = %s",
                    (user_id, sp_id)
                )
                row = cur.fetchone()
                if row:
                    cur.execute(f"UPDATE {SCHEMA}.favorites SET created_at = created_at WHERE id = %s", (row[0],))
                conn.commit()
            finally:
                conn.close()
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"success": True, "added": False})}

    if method == "PUT":
        body = json.loads(event.get("body") or "{}")
        result = update_name(user_id, body.get("name", ""))
        if "error" in result:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps(result)}
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(result)}

    return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}
