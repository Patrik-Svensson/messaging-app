import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from 'graphql';
import { GraphQLFieldResolver } from 'graphql';
import { ThreadType } from './types/ThreadType';
import { threadResolvers } from './resolvers/threadResolvers';
import { userResolvers } from './resolvers/userResolvers';
import { AppDataSource } from '../config/DataSource';
import { Account } from '../entities/Account';
import jwt from 'jsonwebtoken';
import { Thread } from '../entities/Thread';
import { UserType } from './types/UserType';
import { Message } from '../entities/Message';
import { io, users } from '../app';

interface Context {
  user: {
    id: string;
    username: string;
  } | null;
}

const RootQuery = new GraphQLObjectType<any, Context>({
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
      args: {
        username: { type: GraphQLString },
      },
      resolve: (parent, args, context) => {
        return threadResolvers.threads(parent, args, context);
      }
    },
    getThreads: {
      type: new GraphQLList(ThreadType),
      args: {
        username: { type: GraphQLString },
      },
      resolve: async (parent, { username }, context) => {
        const threads = await AppDataSource.getRepository(Thread).find({
          relations: ["participants", "messages", "messages.author"], 
        });
      
        const filteredThreads = threads.filter(thread => 
          thread.participants.some(participant => participant.username === username)
        );

        filteredThreads.forEach(thread => {
          thread.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
      
        return filteredThreads;
      }      
    },
    getUsersExcluding: {
        type: new GraphQLList(UserType),
        args: {
          username: { type: GraphQLString },
        },
        resolve: (parent, args, context) => {
          return userResolvers.getUsers(args.username);
        }
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
        creator: { type: GraphQLString },
      },      
      resolve: threadResolvers.createThread as GraphQLFieldResolver<any, Context>
    },
    addMessage: {
      type: ThreadType,
      args: {
          threadId: { type: GraphQLString },
          message: { type: GraphQLString },
          username: { type: GraphQLString },
      },
      resolve: async (_, { threadId, message, username }) => {
          const threadRepo = AppDataSource.getRepository(Thread);
          const userRepo = AppDataSource.getRepository(Account);
          const messageRepo = AppDataSource.getRepository(Message);
  
          const thread = await threadRepo.findOne({
              where: { id: parseInt(threadId, 10) },
              relations: ["messages", "messages.author"],
          });
  
          if (!thread) throw new Error("Thread not found");
  
          const user = await userRepo.findOne({ where: { username } });
          if (!user) throw new Error("User not found");
  
          const newMessage = messageRepo.create({
              text: message,
              author: user,
              thread,
              creationDate: new Date(),
              timestamp: new Date(),
          });
  
          await messageRepo.save(newMessage);
  
          const updatedThread = await threadRepo.findOne({
              where: { id: thread.id },
              relations: ["messages", "messages.author", "participants"],
          });
  
          if (updatedThread) {
              updatedThread.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          }
  
          // Emit the new message event with the generated ID
          if (updatedThread === null) {
            return
          }           

          updatedThread.participants.forEach(participantName => {
            if (username === participantName.username) {
                return;
            }
        
            const recipientSocketId = users.get(participantName.username); // Lookup socket ID using username
        
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', { message: newMessage, threadId: updatedThread.id });
            }
        });
  
          return updatedThread;
      }
    }  
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

export default schema;
