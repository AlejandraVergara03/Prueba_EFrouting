import json
import requests
import mysql.connector
from mysql.connector import Error

def lambda_handler(event, context):
    db = None
    cursor = None
    try:
        # Conexión a MySQL
        db = mysql.connector.connect(
            host="database-prueba1.cxymcuu2e9l4.us-east-1.rds.amazonaws.com",
            user="alejadb",
            password="Gokuesmimaestro",
            database="CoinPrice"
        )
        
        cursor = db.cursor()
        
        # Definir la URL de la API y los parámetros
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
        parameters = {"id": "1,1027"}  # Bitcoin (1) y Ethereum (1027)
        headers = {
            "Accepts": "application/json",
            "X-CMC_PRO_API_KEY": "30850222-9650-43fb-83fd-b6bfbed357b8"
        }
        
        # Realizar la solicitud
        response = requests.get(url, headers=headers, params=parameters)
        
        if response.status_code == 200:
            try:
                data = response.json()
        
                
                for coin_id, coin_data in data['data'].items():
                    name = coin_data['name']
                    symbol = coin_data['symbol']
                    cmc_rank = coin_data['cmc_rank']
                    last_update = coin_data['last_updated']
                    price = coin_data['quote']['USD']['price']
                    volume_change_24h = coin_data['quote']['USD']['volume_change_24h']
                    percent_change_1h = coin_data['quote']['USD']['percent_change_1h']
        
                    # Insertar  datos  `Exchanges`
                    exchanges_insert_query = """
                    INSERT INTO Exchanges (name, symbol, cmc_rank)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    name = VALUES(name), symbol = VALUES(symbol), cmc_rank = VALUES(cmc_rank);
                    """
        
                    # Datos para la tabla `Exchanges`
                    exchanges_data = (name, symbol, cmc_rank)
        
                    # Ejecutar la inserción en `Exchanges`
                    cursor.execute(exchanges_insert_query, exchanges_data)
        
                    # 2. Insertar  datos en la tabla `quotes` 
                    quotes_insert_query = """
                    INSERT INTO quotes (price, volume_change_24h, percent_change_1h)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    price = VALUES(price), volume_change_24h = VALUES(volume_change_24h), percent_change_1h = VALUES(percent_change_1h);
                    """
        
                    # Datos para la tabla `quotes`
                    quotes_data = (price, volume_change_24h, percent_change_1h)
        
                    # Ejecutar la inserción en `quotes`
                    cursor.execute(quotes_insert_query, quotes_data)
        
                    # Guardar los cambios en la base de datos
                    db.commit()
        
                    print(f"Datos de {name} ({symbol}) insertados o actualizados exitosamente.")
            except ValueError as e:
                print(f"Error al parsear JSON: {e}")
        else:
            print(f"Error: {response.status_code}, {response.text}")
    
    except Error as e:
        print(f"Error en la conexión a la base de datos: {e}")
    
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

    return {
        "statusCode": 200,
        "body": json.dumps("Operación completada")
    }