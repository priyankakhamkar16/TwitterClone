import { gql } from '@apollo/client';

export const GET_TWEETS = gql`
  query GetTweets {
    tweets {
      id
      content
      createdAt
      userId
      image
      video
    }
  }
`;
