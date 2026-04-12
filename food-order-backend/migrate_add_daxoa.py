import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    conn = psycopg2.connect(
        user="postgres", password="1234",
        host="localhost", port="5432",
        dbname="food_ordering_system"
    )
    cur = conn.cursor()

    # Them cot daXoa neu chua co
    cur.execute("""
        ALTER TABLE monan
        ADD COLUMN IF NOT EXISTS daxoa BOOLEAN NOT NULL DEFAULT FALSE;
    """)

    conn.commit()

    # Xac nhan cot da duoc them
    cur.execute("""
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_name = 'monan' AND column_name = 'daxoa';
    """)
    row = cur.fetchone()

    cur.close()
    conn.close()

    if row:
        print("Migration OK! Column:", row[0], "| Type:", row[1], "| Default:", row[2])
    else:
        print("Column not found - something went wrong!")

except Exception as e:
    print(f"Error: {e}")
