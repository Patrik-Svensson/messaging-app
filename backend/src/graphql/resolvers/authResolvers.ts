import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../config/DataSource';
import { Account } from '../../entities/Account';
import { GraphQLFieldResolver } from 'graphql';

interface Context {
  req: {
    body: any; 
  };
  user: {
    id: string;
    username: string;
  } | null;
}

export const authResolvers = {
  login: (async (_: any, args: { username: string; password: string }, context, info) => {
    const userRepo = AppDataSource.getRepository(Account);
    const user = await userRepo.findOneBy({ username: args.username });

    if (!user) throw new Error('User not found');

    const isValid = (args.password === user.password);

    if (!isValid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    return { id: user.id, username: user.username, token };
  }) as GraphQLFieldResolver<any, Context, { username: string; password: string; additionalArg?: any }>
}; 