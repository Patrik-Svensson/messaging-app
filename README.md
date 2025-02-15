# Messaging App Backend

This is a full-stack messaging application with a TypeScript/Express/TypeORM backend and a NextJS frontend.

## Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [PostgreSQL](https://www.postgresql.org/) (For database management)
- [TypeScript](https://www.typescriptlang.org/)

## Installation Backend

1. Clone the repository:
   ```sh
   git clone https://github.com/patrik-svensson/messaging-app.git
   cd messaging-app/backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root of the backend directory and configure the following environment variables:
   ```env
    DB_HOST
    DB_PORT
    DB_USERNAME
    DB_PASSWORD
    DB_NAME
    PORT
   ```

## Installation Frontend

1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env.local` file in the root of the frontend directory and configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

## Running the App

### Backend Development Mode
To start the backend server in development mode with live reloading:
```sh
cd backend
npm run dev
```

### Frontend Development Mode
To start the frontend development server:
```sh
cd frontend
npm run dev
```

## Formatting Code
Ensure consistent code formatting with Prettier:
```sh
# For backend
cd backend
npm run format

# For frontend
cd frontend
npm run format
```


