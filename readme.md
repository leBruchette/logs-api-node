# logs-api-node

## Overview
This project provides an API for reading log files in reverse order. It includes a GET endpoint that allows users to retrieve log lines based on specific query parameters.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/leBruchette/logs-api-node.git && cd logs-api-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.sample`:
   ```bash
   cp .env.sample .env
   ```

### Running the Application

To start the application in development mode:
```bash
npm run dev
```

To build and start the application in production mode:
```bash
npm run build && npm run start:dist
```

## Running the Application with Docker Compose

To run the application using Docker Compose, follow these steps:

### Prerequisites

- Docker
- Docker Compose

### Steps

1. **Build and start the Docker containers:**
   ```bash
   docker-compose build && docker-compose up
   ```

This will build the Docker image and start the application in a container, exposing it on port 8200.

### Accessing the API

Once the containers are up and running, you can access the API at:
```
http://localhost:8200/logs
```

You can use the same query parameters as described in the API Endpoints section to interact with the Logs API.

### Running Tests

To run the tests:
```bash
npm test
```

## API Endpoints

### Logs API

The Logs API provides endpoints to read and stream log files.

#### `GET /logs`


Reads and streams lines from a log file.

**Path Parameters:**
- `path` (string): The path to the log file.

**Query Parameters:**
- `lines` (number): The number of lines to read from the end of the file.
- `search` (string): A search term to filter the lines.

**Example Request:**
```http
GET /logs/var/log/test.log&lines=10&search=error
```

**Example Response:**
```json
{
  "file": {
    "name": "/var/log/test.log",
    "size": 128,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "modifiedAt": "2023-01-02T00:00:00.000Z"
  },
  "lines": [
    "error: something went wrong",
    "error: another issue"
  ]
}
```

## How `api/logs/service` Chunks and Streams Data in Reverse

The `LogStreamingService` class in `api/logs/service.ts` is responsible for reading and streaming log files in reverse order. Here is a brief explanation of how it works:

1. **Open the File:**
   The `openFile` method opens the log file for reading.

2. **Get File Details:**
   The `statFile` method retrieves the file's metadata, such as size, creation time, and modification time.

3. **Read and Stream Data:**
   The `readLines` method initiates the reading process and writes the file details to the response.

4. **Chunk Reading:**
   The `writeChunkToResponse` method reads the file in chunks of a specified buffer size. It reads the file from the end towards the beginning, ensuring that the data is streamed in reverse order.

5. **Handle Partial Lines:**
   The method handles partial lines that may occur when reading chunks. It ensures that lines are correctly concatenated and split.

6. **Recursive Reading:**
   The method recursively calls itself to read the next chunk until the specified number of lines is read or the beginning of the file is reached.

By reading the file in chunks and processing each chunk in reverse order, the service efficiently streams the log data in reverse, allowing for real-time log analysis and monitoring.
