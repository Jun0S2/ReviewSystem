import psycopg2

DATABASE_URL = "postgresql://postgres.pkuwerqqifhzydictcqv:Xypsu0-pojmiw-qinjen@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
# DATABASE_URL = "postgresql://postgres:Xypsu0-pojmiw-qinjen@db.pkuwerqqifhzydictcqv.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("연결 성공!")
    conn.close()
except Exception as e:
    print("연결 실패:", e)
