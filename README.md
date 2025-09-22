# MovieHub Backend

Movie recommendation board backend with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/login)
- Movie recommendations
- Voting system (upvote/downvote)
- Comments
- Admin moderation

## Setup

# MovieHub Backend Setup

## Requirements
- Node.js (v18+)
- Mongoose

## Installation
1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`

3. Start the development server:
```bash
npm run dev
```

## Environment Variables
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (default: 1d)
- `COOKIE_EXPIRES_IN` - Cookie expiration in seconds (default: 86400)
- `CORS_ORIGIN` - Allowed CORS origin (e.g., http://localhost:5173)
- `NODE_ENV` - Environment (development/production)
- `BASE_URL` - Base URL for the backend (e.g., http://localhost:5000)

## Production
```bash
npm run build
npm start
```

## API Documentation

See [API_DOCS.md](API_DOCS.md) for detailed endpoint documentation.
