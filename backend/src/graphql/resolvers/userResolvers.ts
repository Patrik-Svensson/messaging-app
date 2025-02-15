import { AppDataSource } from '../../config/DataSource';
import { Account } from '../../entities/Account';
import { Not } from 'typeorm';

export const userResolvers = {
  getUsers: async (username: string) => {
    
    const userRepo = AppDataSource.getRepository(Account);
    const users = await userRepo.find({ where: { username: Not(username) } });

    return users
  }
}; 