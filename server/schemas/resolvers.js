// import user from models , auth error from apollo and sign token from utils/auth
const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

// create resolvers
const resolvers = {
  // create query resolver
  Query: {
    me: async (parent, args, context) => {
      // if context.user exists
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          // remove -__v and password from findOne get route
          "-__v -password"
        );
        // return the data
        return userData;
      }
      //   must be logged in - throw error
      throw new AuthenticationError("You must be logged in!");
    },
  },
  Mutation: {
    //   login with email and password
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      // if email doesnt exist, return incorrect credentials

      if (!user) {
        throw new AuthenticationError("Incorrect credentials entered!");
      }
      // verify passwrord
      const correctPw = await user.isCorrectPassword(password);
      // if password is wrong return incorrect credentials
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials entered!");
      }

      //   assign token
      const token = signToken(user);
      //   return token and user
      return { token, user };
    },

    // cretae new user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      //   assign token to user
      const token = signToken(user);
      // return user and token
      return { token, user };
    },

    //
    saveBook: async (parent, args, context) => {
      // find user and update by user's id
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          //   save book for user
          { $addToSet: { savedBooks: args.input } },
          //   return new savedBooks
          { new: true }
        );
        // return the updatedUser
        return updatedUser;
      }
      //   must be logged in to save a book
      throw new AuthenticationError("You must be logged in!");
    },

    // remove book from user's list
    removeBook: async (parent, args, context) => {
      if (context.user) {
        //   find by user id and updated savedBooks
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          //   pull from savedbooks
          { $pull: { savedBooks: { bookId: args.bookId } } },
          //   return new saved books
          { new: true }
        );
        // return updated user
        return updatedUser;
      }
      //   must be logged in to remove a book
      throw new AuthenticationError("You must be logged in!");
    },
  },
};

// export resolvers to index.js
module.exports = resolvers;
