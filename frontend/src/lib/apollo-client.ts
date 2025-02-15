import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql', // Adjust this URL to match your backend GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: 'include', // If you need to handle cookies
});

export default client;