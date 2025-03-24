# Shopee Scraper API

A robust and undetectable API for scraping product data from Shopee Taiwan. This API is designed to bypass anti-scraping measures while maintaining high performance and reliability.

## Features

- Undetectable scraping with rotating user agents and random delays
- Robust error handling and retry mechanism
- Scalable architecture
- TypeScript support for better type safety
- Comprehensive documentation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- ngrok (for exposing the API publicly)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shopee-scraper-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=3000
```

## Running the API

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Using ngrok to expose the API
```bash
ngrok http 3000
```

## API Usage

### Get Product Details

```http
GET /shopee?storeId={storeId}&dealId={dealId}
```

#### Parameters
- `storeId` (required): The Shopee store ID
- `dealId` (required): The Shopee product ID

#### Example Request
```http
GET /shopee?storeId=178926468&dealId=21448123549
```

#### Example Response
```json
{
  "data": {
    // Shopee product data matching the get_pc API format
  },
  "error": 0,
  "message": "success"
}
```

### Health Check

```http
GET /health
```

#### Example Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Anti-Detection Measures

The API implements several techniques to avoid detection:

1. **Rotating User Agents**: Each request uses a different user agent from a pool of modern browser user agents.
2. **Random Delays**: Requests are spaced with random delays to mimic human behavior.
3. **Request Headers**: Proper headers are set to mimic legitimate browser requests.
4. **Error Handling**: Robust retry mechanism with exponential backoff.
5. **Proxy Support**: Optional proxy support for IP rotation (requires external proxy service).

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Missing or invalid parameters
- `500 Internal Server Error`: Server-side errors
- `503 Service Unavailable`: Rate limiting or temporary issues

## Performance Optimization

- Connection pooling
- Request timeout handling
- Efficient error recovery
- Memory leak prevention

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 