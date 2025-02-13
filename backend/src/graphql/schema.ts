import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/DataSource';
import { Account } from '../entities/Account';
import { Thread } from '../entities/Thread';
import { In } from 'typeorm';

const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: {
    id: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
      id: { type: GraphQLString },
      username: { type: GraphQLString },
      token: { type: GraphQLString },
    },
  });

const ThreadType = new GraphQLObjectType({
    name: 'Thread',
    fields: {
      id: { type: GraphQLString },
      title: { type: GraphQLString },
      messages: { type: new GraphQLList(MessageType) },
      participants: { type: new GraphQLList(UserType) },
    },
  });

// TODO: add hashed passwords
const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    login: {
      type: UserType,
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(_, { username, password }) {
        const userRepo = AppDataSource.getRepository(Account);
        const user = await userRepo.findOneBy({ username });

        if (!user) throw new Error('User not found');

        const isValid = (password === user.password);

        if (!isValid) throw new Error('Invalid credentials');

        const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET!, {
          expiresIn: '1h',
        });

        return { id: user.id, username: user.username, token };
      },
    },
    threads: {
      type: new GraphQLList(ThreadType),
      async resolve(_, __, { user }) {
        if (!user) throw new Error('Not authenticated');

        const threadRepo = AppDataSource.getRepository(Thread);
        const threads = await threadRepo.find({ where: { participants: user.id } });

        return threads;
      },
    },
    // FOR TESTING WITH GRAPHIQL
    allThreads: {
      type: new GraphQLList(ThreadType),
      async resolve() {
        const threadRepo = AppDataSource.getRepository(Thread);
        const threads = await threadRepo.find();
        return threads;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createThread: {
      type: ThreadType,
      args: {
        title: { type: GraphQLString },
        participants: { type: new GraphQLList(GraphQLString) },
      },
      async resolve(_, { title, participants }) {
        const userRepo = AppDataSource.getRepository(Account);
        const participantAccounts = await userRepo.findBy({ username: In(participants) });

        if (participantAccounts.length !== participants.length) {
          throw new Error('Some participants not found');
        }

        const threadRepo = AppDataSource.getRepository(Thread);
        const newThread = threadRepo.create({ title, participants: participantAccounts });
        await threadRepo.save(newThread);

        return newThread;
      },
    },
  },
});


const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

export default schema;
