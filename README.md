# Iot-monitor-dashboard

Web application for monitoring IoT Devices, collecting telemetry, display sensor measurements & detecting conditions.

### Development
The project is under active development

## Overview

The application is designed to recieve IoT telemetry through MQTT, process & store measurements in PostgreSQL and display information on a dashboard.

### Architecture (placeholder)

```
{IoT Device Simulator}
          │
          │ JSON
          V
        MQTT
          │
          V
{Mosquitto MQTT Broker}
          │
          V
     {Backend}
          │
          ├── MQTT Subscriber
          ├── Data Validation
          ├── Device Management
          ├── Alert Processing
          ├── Logic
          └── REST API
          │
          V
 {PostgreSQL Database}
          │
          V
     REST API
          │
          V
 {Next.js / React}
          │
          V
  Monitoring Dashboard
Real-time updates:
MQTT
  │
  V
Backend
  │
  ├── Database
  │
  └── (WebSocket)?
              │
              V
          Dashboard
```

### Stack

- Next.js
- Tailwind Css
- Node.js
- Javascript
- PostGreSQL
- Prisma
- MQTT, Mosquitto
- Github Actions

## Project 

- `frontend/` - Next.js web application
- `backend/` - Node.js backend and REST API
- `simulator/` - Simulated IoT devices
- `docker/` - Container configurations

## Features (for now)
- MQTT telemetry using Mosquitto
- IoT device simulation
- Telemetry validation & error handling
- Measurement storage in PostgreSQL
- Database operatiosn using Prisma ORM
- Measurement filtering (by metric and timestamp)
- Database connection recovery
- Backend validation & database integration tests

### Planned features

- REST API for device and measurement retrieval
- Dashboard overview
- Detail pages
- Historical sensor charts
- Real-time frontend updates
- Device management interface
- Alert detection and processing
- Extended automated testing and CI/CD

## Database 
The backend uses PostgreSQL with Prisma ORM to manage IoT devices and sensor measurements.

Database includes:
* Device
* Measurement
* Alert

Validated MQTT telemetry is stored using databbase transactions. 


### Setup

Start PostgreSQL using Docker Compose:


```cmd
docker compose --env-file docker/.env -f docker/compose.yaml up -d
```

Configuriation in backend/.env

From the backend/ directory, apply Prisma migrations and generate the client

```
npx prisma migrate dev
npx prisma generate
```

Verify database connectivity and retrieval

```
npm run db:check
npm run db:retrieval
```

The local PostgreSQL container is accessible through port 5433.


