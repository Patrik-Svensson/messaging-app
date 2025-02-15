import { GraphQLObjectType, GraphQLString } from 'graphql';
import { UserType } from './UserType';

export const MessageType = new GraphQLObjectType({
    name: 'Message',
    fields: {
      id: { type: GraphQLString },
      text: { type: GraphQLString },
      author: { type: UserType },
      timestamp: { type: GraphQLString },
    },
  });