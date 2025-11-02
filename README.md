# Product Service

A showcase microservice project using NestJS.  
This service is responsible for handling product-related operations.  
It provides APIs to create a product and get product details by ID, equipped with caching and event-driven communication.

## Technology Stack
- NestJS
  - TypeORM
- PostgreSQL
- Redis
- RabbitMQ
- Docker

## Prerequisites
- Node.js (v18 or newer)
- Docker & Docker Compose

## How to Run

You can run this service in two ways:

### 1. All services
Visit the [runner repo](https://github.com/dodydestriady/ms-runner) to run all the services

### 2. Standalone Mode
Run the Product Service only:

```bash
docker-compose up -f docker-compose.yml
```
Makesure you run this if you want to run other services, and uncomment the networks shared-net in compose
```
docker network create shared-net
```
This will start:
- Product Service (port 3000)
- PostgreSQL (internal port 5432)
- Redis (internal port 6379)
- RabbitMQ (ports 5672, 15672)
- Database migrations will run automatically


## API Overview
| Method |	Endpoint |	Description |
| :---: | :---: | :---: |
| POST |	/products |	Create a new product |
| GET |	/products/:id |	Get product details by ID |

### Example Requests
Create a product:
```
curl -X POST http://localhost:3000/products \
-H "Content-Type: application/json" \
-d '{"name": "Mechanical Keyboard", "price": 1200000, "qty": 100}'
```

Get product by ID:
```
curl -X GET http://localhost:3000/products/1 \
-H "Content-Type: application/json"
```

## Architecture
- Controller Layer: Handles HTTP requests and routes.

- Service Layer: Contains business logic and orchestrates cache, DB, and events.

- Repository Layer: Abstracted via TypeORM.

- Event-Driven: Publishes product.created events to RabbitMQ.

- Caching: Product reads are cached in Redis and invalidated on updates.
- The service uses TypeORM migrations to manage schema changes.