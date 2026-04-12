import psycopg2
import re

try:
    conn = psycopg2.connect(user="postgres", password="1234", host="localhost", port="5432", dbname="food_ordering_system")
    with open('FoodOrderingSystemDB.sql', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Lọc bỏ các lệnh của psql (bắt đầu bằng \c) và CREATE DATABASE (vì đã tạo)
    clean_lines = []
    for line in lines:
        if line.strip().startswith('\\c'):
            continue
        if line.strip().upper().startswith('CREATE DATABASE'):
            continue
        if '```' in line:
            continue
        clean_lines.append(line)
        
    sql = "".join(clean_lines)
    
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    print("Ran SQL script successfully!")
except Exception as e:
    print(f"Error running SQL: {e}")
