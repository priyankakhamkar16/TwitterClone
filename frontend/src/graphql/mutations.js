import { gql } from '@apollo/client';

// Mutation to add a tweet
export const ADD_TWEET = gql`
  mutation AddTweet($input: TweetInput!) {
    addTweet(input: $input) {
      id
      content
      userId
      createdAt
      image
      video
    }
  }
`;

// Other mutations
export const ADD_COMMENT = gql`
  mutation AddComment($tweetId: ID!, $userId: String!, $content: String!) {
    addComment(tweetId: $tweetId, userId: $userId, content: $content) {
      id
      tweetId
      userId
      content
      createdAt
    }
  }
`;

export const LIKE_TWEET = gql`
  mutation LikeTweet($tweetId: ID!, $userId: String!) {
    likeTweet(tweetId: $tweetId, userId: $userId) {
      id
      likes
    }
  }
`;
