# Transaction Agent

Network connectivity testing agent built with NestJS.

## Description

This agent provides REST API endpoints for testing network connectivity using TCP, UDP, and ICMP protocols. It's designed to validate network policies and connectivity rules in distributed systems.

## Features

- **TCP Connectivity Testing**: Connect to TCP ports and measure response times
- **UDP Connectivity Testing**: Send UDP packets and validate responses
- **ICMP Testing**: Ping testing with latency measurement
- **Policy Validation**: Check if connections succeed/fail as expected
- **Health Monitoring**: Built-in health check and capabilities endpoints

## API Endpoints

### GET /api/probe
Test network connectivity between source and destination.

**Query Parameters:**
- `srcIp`: Source IP address
- `srcPort`: Source port number  
- `dstIp`: Destination IP address
- `dstPort`: Destination port number
- `protocol`: Protocol type (tcp/udp/icmp)
- `expectedToFail`: Expected result (optional, default: false)
- `timeout`: Timeout in milliseconds (optional, default: 5000)

**Example:**
```
GET /api/probe?srcIp=192.168.1.100&srcPort=12345&dstIp=192.168.1.200&dstPort=80&protocol=tcp&timeout=5000
```

**Response:**
```json
{
  "result": true,
  "message": "Connection successful",
  "latency": 15,
  "protocol": "tcp",
  "details": {
    "srcIp": "192.168.1.100",
    "srcPort": 12345,
    "dstIp": "192.168.1.200",
    "dstPort": 80,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "actualResult": "connected",
    "policyViolation": false
  }
}
```

### GET /api/health
Get agent health status.

### GET /api/capabilities  
Get supported protocols and features.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuration

The agent runs on port 7500 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm run start
```

## Project Structure

```
src/
├── common/
│   └── interfaces/
│       └── agent.interface.ts         # Type definitions
├── connectivity/                      # Connectivity module
│   ├── dto/
│   │   └── connectivity.dto.ts        # Request validation DTOs
│   ├── services/
│   │   ├── connectivity.service.ts    # Business logic
│   │   └── network.service.ts         # Low-level network operations
│   ├── connectivity.controller.ts     # REST API endpoints
│   └── connectivity.module.ts         # Module configuration
├── app.module.ts                      # Root module
└── main.ts                           # Application bootstrap
```

## License

[MIT licensed](LICENSE).
