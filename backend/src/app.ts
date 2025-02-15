import express from 'express';
import cors from 'cors';
import { AppDataSource, ensureDatabaseExists } from './config/DataSource';
import dotenv from 'dotenv';
import { Account } from './entities/Account';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true, 
  })
);

const populateDatabase = async () => {
  console.log('Populating the database with initial data...');
  
  const initialUsers = [
    { username: 'john_doe', password: 'password123' },
    { username: 'jane_smith', password: 'securepassword' },
    { username: 'patrik_svensson', password: 'hej123' },
  ];
  await AppDataSource.getRepository(Account).save(initialUsers); 
};

const startServer = async () => {
  try {
    await ensureDatabaseExists(); 
    await AppDataSource.initialize();
    console.log('Connected to the PostgreSQL database');

    await populateDatabase(); 

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

startServer();
