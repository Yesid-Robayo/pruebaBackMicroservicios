# Prueba Back - API con NestJS - Prisma - PostgreSQL - Docker 

Este proyecto es una API basada en microservicios desarrollada con NestJS para gestionar pedidos. Incluye dos microservicios principales: **Usuarios** y **Pedidos**, y utiliza PostgreSQL como base de datos, Prisma como ORM, y Docker para el despliegue en contenedores.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker](https://www.docker.com/) (v20 o superior)
- [Docker Compose](https://docs.docker.com/compose/) (v2 o superior)

## Estructura del Proyecto

El proyecto está dividido en dos microservicios principales:

1. **Microservicio de Usuarios**:
   - Crear un usuario.
   - Autenticación con JWT.
   - Obtener información del usuario autenticado.

2. **Microservicio de Pedidos** (Requiere iniciar sesion para usar toda la API):
   - Crear un pedido asociado a un usuario.
   - Listar los pedidos de un usuario.
   - Cambiar el estado de un pedido (pendiente, en proceso, completado) "Requiere autenticarse con rol ADMIN".

Además, el proyecto incluye:

- **Dockerfile** y **docker-compose.yml** para el despliegue en contenedores.
- Pruebas unitarias con Jest.
- Documentación de la API generada con Swagger.

## Ejecución con Docker

Sigue estos pasos para configurar y ejecutar el proyecto ya en produccion:

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/Yesid-Robayo/pruebaBackMicroservicios
   cd pruebaBackMicroservicios

2. **Configurar variables de entorno**:
   No es necesario crear un archivo .env, ya que, para mayor comodidad, este ya está subido al proyecto.

3. **Ejecutar Docker y ejecutar el comando para iniciar el proyecto**:
   ```bash
    docker-compose up -d

4. **Ejecutar Docker y ejecutar el comando para iniciar el proyecto**:
   
   Ahora puedes acceder a la documentación de la API y probar todas las endpoints disponibles.

## Instalacion

# Para Ejecutar Pruebas

Si solo deseas ejecutar las pruebas unitarias del proyecto, sigue estos pasos:

1. **Clonar el repositorio**:
   
   ```bash
   git clone https://github.com/Yesid-Robayo/pruebaBackMicroservicios
   cd pruebaBackMicroservicios

2. **Instalar dependencias y generar prisma client**:
   
Order Service

     
      cd order-service
      npm install
      npm run prisma:generate
      npm run prisma:migrate
      npm run test

User Service
    
   
      cd..
      cd user-service
      npm install
      npm run prisma:generate
      npm run prisma:migrate
      npm run test

Al ejecutar las pruebas unitarias, la consola mostrará el proceso de ejecución y los resultados de cada prueba. Verás mensajes indicando qué pruebas fueron exitosas y si hubo fallos.

   
# Para Desarrollo

Si deseas seguir con el desarrollo del proyecto, sigue estos pasos:

1. **Clonar el repositorio**:
   
   ```bash
    git clone https://github.com/Yesid-Robayo/pruebaBackMicroservicios
   cd pruebaBackMicroservicios

2. **Instalar dependencias y generar prisma client**:

Order Service

      
      cd order-service
      npm install
      npm run prisma:generate
      npm run prisma:migrate
      npm run start:dev

User Service

   
      cd..
      cd user-service
      npm install
      npm run prisma:generate
      npm run prisma:migrate
      npm run start:dev

    
El servidor estará disponible en [http://localhost:3001](http://localhost:3001) ( Microservicio User).

El servidor estará disponible en [http://localhost:3002](http://localhost:3002) ( Microservicio Order).

## Documentación de la API

La documentación de la API está generada con Swagger y puede accederse en:

**Swagger UI**: 
  
- User Microservicio
  [http://localhost:3001/api](http://localhost:3001/api) 
- Order Microservicio
  [http://localhost:3002/api](http://localhost:3002/api) 

**Documentación JSON**: 
  
- User Microservicio
  [http://localhost:3001/api-json](http://localhost:3001/api-json)
- Order Microservicio
  [http://localhost:3002/api-json](http://localhost:3002/api-json)


## Endpoints Principales

### Microservicio de Usuarios

- **POST /user/createUser**: Crear un nuevo usuario.
- **GET /user/me**: Obtener información del usuario autenticado (requiere JWT).
- **POST /auth/login**: Autenticación de usuario (genera un JWT).
- **POST /auth/logout**: Cierra sesion eliminando el token.

### Microservicio de Pedidos

- **POST /order/createOrder**: Crear un nuevo pedido (requiere JWT).
- **GET /order/getOrdersById/:id**: Listar todos los pedidos de un usuario (requiere JWT).
- **PATCH /order/updateOrderStatus/:id**: Cambiar el estado de un pedido (requiere JWT y tener el rol de ADMIN).

## Tecnologías Utilizadas

- **NestJS**: Framework para la construcción de microservicios.
- **PostgreSQL**: Base de datos relacional.
- **Prisma**: ORM para la gestión de la base de datos.
- **Kafka**: Sistema de mensajería distribuida para la comunicación entre microservicios.
- **Docker**: Contenerización del proyecto.
- **JWT**: Autenticación basada en tokens.
- **Swagger**: Documentación de la API.
- **Jest**: Pruebas unitarias.

## Buenas Prácticas

- **Principios SOLID**: Aplicados en la estructura del código.
- **DTOs**: Uso de Data Transfer Objects para la validación de datos.
- **Separación de responsabilidades**: Cada microservicio tiene su propia lógica y base de datos.


