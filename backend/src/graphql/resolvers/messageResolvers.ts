import { AppDataSource } from '../../config/DataSource';
import { Thread } from '../../entities/Thread';
import { In } from 'typeorm';
import { Message } from '../../entities/Message';
import { GraphQLFieldResolver } from 'graphql';

interface Context {
  user: {
    id: string;
    username: string;
  } | null;
}

export const messageResolvers = {
  addMessage: (async (_: any, { threadId, content }: { threadId: string; content: string }, { user }: Context) => {
    if (!user) throw new Error('Not authenticated');

    const threadRepo = AppDataSource.getRepository(Thread);
    const thread = await threadRepo.findOne({ 
      where: { id: In([threadId]) },
      relations: ['participants'] 
    });

    if (!thread || !thread.participants.some(p => p.id === parseInt(user.id))) {
      throw new Error('Not authorized to post in this thread');
    }

    const messageRepo = AppDataSource.getRepository(Message);
    const newMessage = messageRepo.create({
      text: content,
      thread,
      author: { id: parseInt(user.id) }
    });
    await messageRepo.save(newMessage);
    return newMessage;
  }) as GraphQLFieldResolver<any, Context, { threadId: string; content: string }>
}; 