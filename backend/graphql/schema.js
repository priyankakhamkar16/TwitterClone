const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLInputObjectType,
} = require('graphql');
const Tweet = require('../models/tweetModel');
const Comment = require('../models/commentModel');

// Define the CommentType GraphQL object
const CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    id: { type: GraphQLID },
    tweetId: { type: GraphQLID },
    userId: { type: GraphQLString },
    content: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

// Define the TweetType GraphQL object
const TweetType = new GraphQLObjectType({
  name: 'Tweet',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    image: { type: GraphQLString },
    video: { type: GraphQLString },
    likes: { type: new GraphQLList(GraphQLString) }, // List of user IDs who liked the tweet
    comments: { type: new GraphQLList(CommentType) }, // List of comments
  }),
});

// Define the RootQuery with two fields: 'tweets' and 'comments'
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    tweets: {
      type: new GraphQLList(TweetType),
      resolve() {
        return Tweet.find().sort({ createdAt: -1 }).populate('comments'); // Populate comments from Comment model
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      args: { tweetId: { type: GraphQLID } },
      resolve(parent, args) {
        return Comment.find({ tweetId: args.tweetId });
      },
    },
  },
});

// Define the Mutation with 'addTweet', 'likeTweet', and 'addComment' fields
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addTweet: {
      type: TweetType,
      args: {
        input: { type: new GraphQLInputObjectType({
          name: 'TweetInput',
          fields: {
            content: { type: GraphQLString },
            userId: { type: GraphQLString },
            image: { type: GraphQLString },
            video: { type: GraphQLString },
          },
        })},
      },
      async resolve(parent, { input }) {
        const { content, userId, image, video } = input;
        const tweet = new Tweet({
          content,
          userId,
          image, // Add image if provided
          video, // Add video if provided
          createdAt: new Date(),
          likes: [],
          comments: [],
        });
        return await tweet.save();
      },
    },
    likeTweet: {
      type: TweetType,
      args: {
        tweetId: { type: GraphQLID },
        userId: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const tweet = await Tweet.findById(args.tweetId);
        if (tweet) {
          // Check if user already liked the tweet
          if (!tweet.likes.includes(args.userId)) {
            tweet.likes.push(args.userId);
            await tweet.save();
          } else {
            // If the user already liked the tweet, remove the like
            tweet.likes = tweet.likes.filter(like => like !== args.userId);
            await tweet.save();
          }
          return tweet;
        }
        throw new Error('Tweet not found');
      },
    },
    addComment: {
      type: CommentType,
      args: {
        tweetId: { type: GraphQLID },
        userId: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const comment = new Comment({
          tweetId: args.tweetId,
          userId: args.userId,
          content: args.content,
          createdAt: new Date(),
        });
        await comment.save();

        // Push the comment's ID to the tweet's comments array
        await Tweet.findByIdAndUpdate(args.tweetId, {
          $push: { comments: comment._id },
        });

        return comment;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
