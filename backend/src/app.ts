import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { AppDataSource, ensureDatabaseExists } from './config/DataSource';
import schema from './graphql/schema';
import { Account } from './entities/Account';

dotenv.config();

const app = express();
const server = createServer(app); // Create an HTTP server
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
      origin: "http://localhost:3000", // Ensure this matches frontend
      methods: ["GET", "POST"],
      credentials: true, // Allow credentials (cookies, headers, etc.)
  }
});


// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

const users = new Map(); 

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Store user ID when they join
    socket.on("register", (user) => {
        users.set(user.username, socket.id);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        for (let [userId, socketId] of users.entries()) {
            if (socketId === socket.id) {
                users.delete(userId);
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});


// Populate Database with Initial Data
const populateDatabase = async () => {
  try {
    console.log('Populating the database with initial data...');

    const initialUsers = [
      { username: 'john_doe', password: 'password123' },
      { username: 'jane_smith', password: 'securepassword' },
      { username: 'patrik_svensson', password: 'hej123' },
    ];

    const userRepo = AppDataSource.getRepository(Account);
    await userRepo.save(initialUsers);

    console.log('Database population complete.');
  } catch (error) {
    console.error('Error populating database:', error);
  }
};

// Start Server
const startServer = async () => {
  try {
    await ensureDatabaseExists();
    await AppDataSource.initialize();
    console.log('Connected to PostgreSQL database');

    await populateDatabase();

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

startServer();

export { io, users }; // Export io instance for usage in other modules
