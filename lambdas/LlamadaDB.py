import json
import mysql.connector
import os
import datetime 
from decimal import Decimal

def custom_serializer(obj):
    """Función para convertir organizar la entrega del datetime."""
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()  # Convertir datetime a string ISO 8601
    elif isinstance(obj, Decimal):
        return float(obj)  # Convertir Decimal a float
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

def lambda_handler(event, context):
    # Conectar a la base de datos 
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
    except mysql.connector.Error as err:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error connecting to the database: {err}")
        }
    
    cursor = conn.cursor(dictionary=True)

    # Ejecutar la consulta 
    query = """
        SELECT e.name, e.symbol, q.price, q.volume_change_24h, q.percent_change_1h, e.last_update
        FROM Exchanges e
        JOIN quotes q ON e.id = q.id;
    """
    
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error executing query: {err}")
        }
