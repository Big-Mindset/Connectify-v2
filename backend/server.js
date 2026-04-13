// import express from "express";
// import { toNodeHandler } from "better-auth/node";
// import { auth } from "./lib/auth.js";
// import { graphqlHTTP } from "express-graphql"
// import { GraphQLSchema, GraphQLObjectType, graphql, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql"
// const app = express();
// const port = 8000;
// import cors from "cors"
// import { chatType, friendType, messageType, returnType } from "./graphQl/authTypes.js";
// import { prisma } from "./prismaClient.js";
// import { chat_resolver, friends_resolver } from "./graphQl/query_resolver/resolvers.js";
// import { accept_friendrequest, create_group, create_message, send_friendrequest } from "./graphQl/mutation_resolver/resolvers.js";
// import { groupChat_Args, media_Args, status_Args } from "./graphQl/argsTypes.js";

// // import {  authenticate, authQueryFields } from "./graphQl/authentication.js";

// app.use(express.json());




// app.use("/api/auth", toNodeHandler(auth));

// app.listen(port, () => {
//   console.log(`Better Auth app listening on port ${port}`);
// });