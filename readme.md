# Express API Starter with TypeScript

## Overview

This project is a basic starter template for building an Express.js API with TypeScript. It includes essential middleware, logging, and error handling.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/w3cj/express-api-starter.git
   cd express-api-starter
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
npm run build
npm run start:dist
```

### Running Tests

To run the tests:
```bash
npm test
```

## API Endpoints

### Logs API

The Logs API provides endpoints to read and stream log files.

#### `GET /api/v1/logs`

Reads and streams lines from a log file.

**Query Parameters:**
- `path` (string): The path to the log file.
- `lines` (number): The number of lines to read from the end of the file.
- `search` (string): A search term to filter the lines.

**Example Request:**
```http
GET /api/v1/logs?path=test.log&lines=10&search=error
```

**Example Response:**
```json
{
  "file": {
    "name": "test.log",
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
