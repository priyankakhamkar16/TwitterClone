// apolloClient.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:5000/graphql', // Ensure this is correct
    credentials: 'include', // Ensure this is set to 'include' to send cookies with requests
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Use token stored in local storage
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
