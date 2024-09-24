# Prueba Técnica efRouting
En este README encontrarán los pasos para la construcción de la solución a la prueba técnica de Desarrollador Fullstack de efRouting.
## Construcción de una base de datos en AWS:
### Creación RDS
Para crear esta base de datos se utilizó el servicio de RDS que ofrece AWS y, utilizando la opción del motor MySQL con la plantilla de la etapa gratuita, se le asignaron las credenciales necesarias y el resto de campos se dejan a los elegidos por defecto por la plantilla de etapa gratuita.
### Conexion RDS-Workbench
Para poder interactuar con la base de datos de manera más sencilla y gráfica se utilizó la herramienta MySQL Workbench. Para esta conexión, se creó un grupo de seguridad con reglas que permitieran acceso TCP en todos los puertos desde cualquier origen (0.0.0.0/0) y también todo tipo de tráfico, desde cualquier IP a cualquier puerto de tu recurso en AWS.
### Creación de las tablas 
Ya conectado la herramienta Workbench con la RDS, se crearon dos tablas: "Exchanges" y "quotes".

La tabla "Exchanges" contiene las columnas:
 id (la cual es la primary key)
 name (en esta columna se almacena el nombre de la criptomoneda)
 symbol (en esta columna se almacena el simbolo de la criptomoneda)
 cmc_rank (en esta columna se almacena el puesto que ocupa la criptomoneda)
 last_update (Se guarda la hora en que es insertada la información de la criptomoneda)
Tabla "quotes" contiene las columnas:
 id (la cual es la foreing key) 
 price (en esta columna se almacena el precio de la criptomoneda)  
 volume_change_24h (en esta columna se almacena el cambio del volumen de la criptomoneda en las ultimas 24hrs) 
 percent_change_1h (en esta columna se almacena el porcentaje del cambio de la criptomoneda en la ultima hora) 

## Extracción de información desde la API de CoinMarketCap utilizando una función: 
A través del servicio Lambda de AWS, se creó una nueva función en blanco, escogiendo el lenguaje Python y se le asignó el nombre de lambda_currencies. Una vez creada, se le debían agregar las librerías a utilizar, en este caso, requests y mysql connector; esto se hizo a través de las layers.
### Layers
En la pantalla de Lambda, en el menú izquierdo, está el apartado de layers, donde se pueden crear las capas necesarias para tu función. Al crearla, se le asigna un nombre y, en el caso de Python, se debe subir una carpeta de nombre python.zip donde estén instaladas las librerías necesarias (en este caso, requests y mysql connector).

Una vez creadas las layers, uno puede agregarlas a su función entrando a la lambda que se creó, abajo en el apartado de layers, haciendo clic en el botón de añadir layer, que te permite escoger la layer que desees agregar de las que tengas creadas (esto en la opción de layer personalizada, ya que Amazon también proporciona una lista de layers).
### Código Lambda
Este código primero, con mysql connector, realiza la conexión con la BD con sus respectivas credenciales. Luego realiza la solicitud a la API utilizando la URL que se entregó junto a la prueba, los parámetros de las IDs de las criptomonedas de las cuales quería tomar la información (Bitcoin (1) y Ethereum (1027)). En el header de la solicitud se definió que el tipo de contenido que se espera recibir es en formato JSON y la API key que entregó la página de CoinMarketCap al iniciar sesión.

Se realiza la solicitud utilizando requests. Luego, con la información de la respuesta, se extrae información clave sobre cada una, como su nombre, símbolo, rango en el mercado, última actualización, precio actual, cambio de volumen en 24 horas y cambio porcentual en la última hora, ya que estos son los que se insertarán en las tablas de la base de datos ya creadas. Estos valores son insertados en la tabla y columna correspondiente a través de dos queries: uno para "Exchanges" y otro para "quotes".
### Test 
En la lambda hay una opción de configurar un evento de test. En este caso, se utilizó la plantilla predeterminada que entrega la lambda. Este test entrega si la operación fue completada o hay algún error; también se revisa en el Workbench que se insertaron los nuevos datos.
## Desencadenador de Lambda 
La prueba pide que esta solicitud se realice cada 6 horas. Para esto, se le agrega un desencadenador a la lambda, en este caso EventBridge, que permite desencadenar funciones Lambda en respuesta a eventos específicos. En este caso, se setea un tiempo de desencadenamiento de 6 horas.
## Despliegue de una página web en un contenedor Docker:
### Página web
Para la base de la página web se utilizó la librería React, el framework CSS Tailwind CSS y la herramienta Vite. Esta página tiene dos componentes: una barra superior donde se encuentra el logo y un pequeño texto; luego se muestra el componente principal de la página, que son dos gráficas (una lineal y una de barra) donde se muestra el comportamiento de los precios de las criptomonedas a través del tiempo. Para realizar estas gráficas, se tomó la información de la base de datos con una lambda, la cual utilizamos como API, y se grafica utilizando Chart.js.
### Lambda de extracción de datos
Para extraer los datos almacenados en la BD, se implementó una Lambda en AWS en lenguaje Python de nombre "LlamadaDB". Esta también utiliza la layer creada anteriormente de la librería mysql connector. En esta lambda, a diferencia de la primera, utiliza como desencadenador API Gateway, que te permite crear APIs que ejecutan funciones Lambda.
### Código Lambda
Primero se realiza una conversión para que la entrega del dato que contiene la fecha y hora se convierta a un formato que sea compatible con JSON. Luego se realiza la conexión a la BD, con un query, realiza la consulta a la BD y devuelve los resultados en formato JSON.
### Graficar datos
Para realizar las gráficas, se utilizó la biblioteca Chart.js. Se importaron todos los elementos necesarios de esta biblioteca para realizar las gráficas. Se utiliza useEffect para realizar una llamada a la API cuando el componente se monta por primera vez. Luego se realiza una solicitud GET a la API entregada en un URL por el API Gateway. Una vez obtenida la respuesta en tipo JSON, se filtran los datos del precio según el símbolo de cada criptomoneda (BTC y ETH), y se establece que el eje X sea el dato que contiene la fecha y hora. Se establecen los datos que se usarán en los gráficos; luego se crea un contenedor que ubicará ambas gráficas y, utilizando los componentes de react-chartjs-2, Line y Bar, se le asignan los datos establecidos correspondientes para que estos rendericen los gráficos.
### Docker
Una vez construida la página, se creó un Dockerfile en la carpeta de la página. En este se crea una imagen que se basa en una imagen ligera de Node.js, configura el entorno de trabajo, instala las dependencias, copia los archivos de la aplicación, expone un puerto para el acceso externo y establece un comando para ejecutar la aplicación.
### ECR
Primero hay que entrar al servicio ECR de AWS. Se debe crear un nuevo repositorio con el nombre que se desee. Una vez creado, se accede a él y nos muestra un botón de ver comandos de envío. Una vez presionado, este da una serie de comandos para crear una imagen docker, etiquetar la imagen para enviarla al repositorio y enviar esta imagen al repositorio de AWS.
### ECS
El ECS se utiliza para la gestión de aplicaciones en contenedores. Una vez dentro de este servicio, se debe crear un clúster para gestionar y ejecutar aplicaciones en contenedores. Este se encuentra de primero en el menú izquierdo. Una vez adentro, da la opción de crear clúster; se le asigna un nombre y se escoge el tipo de infraestructura, en este caso Fargate. Luego se debe crear una tarea; esta especifica cómo ejecutar uno o más contenedores en un clúster. Para crearla, se debe entrar en definición de tareas y crear una nueva definición de tarea. Se le da un nombre, el tipo de lanzamiento, de nuevo Fargate para este caso, y en la parte de contenedor 1, se debe pegar el URI que pertenece al ECR que se creó anteriormente y se crea la tarea. Después de creada la tarea, se debe crear un servicio; este mantiene que la tarea siempre se esté ejecutando. Para crear este, debes entrar al clúster que creaste. En la parte de servicios, entrar a crear; en la familia se escoge la tarea que se creó anteriormente, se le pone el nombre al servicio, se revisa que en el apartado de redes esté activa la IP pública y se crea este nuevo servicio. Si se entra en la tarea que se está ejecutando en el clúster, en la pestaña de redes se encontrará la IP pública que permite entrar en el sitio web.
### DNS
Se utilizó No-IP, un servicio de DNS dinámico que permite crear un nombre de dominio de forma gratuita y se asocia a este la IP pública entregada por la tarea. De esta manera, se puede acceder al sitio web a través de un DNS.




   























# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
