import { AppDataSource } from '../../config/DataSource';
import { Thread } from '../../entities/Thread';
import { Account } from '../../entities/Account';
import { In } from 'typeorm';
import { GraphQLFieldResolver } from 'graphql';

interface Context {
  user: {
    id: string;
    username: string;
  } | null;
}

export const threadResolvers = {
  threads: async (_: any, { username }: { username?: string }, { user }: Context) => {
    if (!user) throw new Error('Not authenticated');

    const threadRepo = AppDataSource.getRepository(Thread);
    const whereCondition: any = {
      participants: {
        id: In([user.id])
      }
    };

    // If a username is provided, filter by participants' usernames
    if (username) {
      whereCondition.participants = {
        username: In([username])
      };
    }

    const threads = await threadRepo.find({
      where: whereCondition,
      relations: ['participants']
    });

    return threads;
  },

  allThreads: async () => {
    const threadRepo = AppDataSource.getRepository(Thread);
    const threads = await threadRepo.find();
    return threads;
  },

  getThreads: (async (_: any, args: { userId: string }, context: Context) => {
    const threadRepo = AppDataSource.getRepository(Thread);
    const threads = await threadRepo.find({
      where: {
        participants: {
          id: In([args.userId])
        }
      },
      relations: ['participants', 'messages']
    });
    return threads;
  }) as GraphQLFieldResolver<any, Context, { userId: string }>,

  createThread: (async (_: any, args: { title: string; participants: string[] }, context: Context) => {
    const userRepo = AppDataSource.getRepository(Account);
    const participantAccounts = await userRepo.findBy({ username: In(args.participants) });
  
    if (participantAccounts.length !== args.participants.length) {
      throw new Error('Some participants not found');
    }
  
    const threadRepo = AppDataSource.getRepository(Thread);
    const newThread = threadRepo.create({ title: args.title, participants: participantAccounts });
    await threadRepo.save(newThread);
  
    return newThread;
  }) as GraphQLFieldResolver<any, Context, { title: string; participants: string[] }>
  
}; 