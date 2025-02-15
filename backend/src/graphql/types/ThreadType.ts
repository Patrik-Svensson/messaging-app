import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { MessageType } from './MessageType';
import { UserType } from './UserType';

export const ThreadType = new GraphQLObjectType({
  name: 'Thread',
  fields: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    messages: { type: new GraphQLList(MessageType) },
    participants: { type: new GraphQLList(UserType) },
  },
});
