# Product Service

A showcase microservice project using NestJS.  
This service is responsible for handling product-related operations.  
It provides APIs to create a product and get product details by ID, equipped with caching and event-driven communication.

## Stacks
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

### 1. Standalone Mode
Run the Product Service only:

```bash
docker-compose up -f docker-compose.yml
```
Makesure you run this if you want to run other services, and uncomment the networks shared-net in compose
```
docker network create shared-net
```
This will start the Product Service along with its dependencies (PostgreSQL, Redis, RabbitMQ).

### 2. Integrated Mode

If you want to run this as part of the full microservice showcase,
visit the following repository:

ms-application-runner

The application runner will automatically start all related microservices, including Product Service.

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

This service follows a modular clean architecture pattern.

```
src/
├── products/
│   ├── dto/          # Request/response validation
│   ├── entities/     # TypeORM entities
│   ├── interfaces/   # Business contracts
│   ├── product.controller.ts
│   ├── product.service.ts
│   └── product.module.ts
├── migrations/       # TypeORM migration files
├── rabbitmq/         # Event publisher setup
├── redis/            # Redis cache wrapper
```
- Controller Layer: Handles HTTP requests and routes.

- Service Layer: Contains business logic and orchestrates cache, DB, and events.

- Repository Layer: Abstracted via TypeORM.

- Event-Driven: Publishes product.created events to RabbitMQ.

- Caching: Product reads are cached in Redis and invalidated on updates.
- The service uses TypeORM migrations to manage schema changes.

Caching is implemented with Redis, and product data is automatically invalidated when changes occur.

Events are published to RabbitMQ whenever a product is created, allowing other microservices to react.

Author

Created by Dody Des – Software Engineer