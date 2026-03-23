import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import {graphqlHTTP} from "express-graphql"
import {GraphQLSchema , GraphQLObjectType} from "graphql"
const app = express();
const port = 8000;
import cors from "cors"
import { prisma } from "./prismaClient.js";
// import {  authenticate, authQueryFields } from "./graphQl/authentication.js";

app.use(express.json());
app.use(cors({
credentials : true,
methods : ["POST" , "GET" , "DELETE" , "PUT"],
origin: "http://localhost:3000"
}))



const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields : ()=>({
    // ...authQueryFields
    })
})


// const RootMutations = new GraphQLObjectType({
  //     name : "mutations",
  //     fields : ()=>({
    //         ...authenticate.getFields()
    //     })
    // })
    
    
    const authenticationSchema = new GraphQLSchema({
      // mutation :authenticate,
      query : RootQuery
    })
    
    app.use("/graphiql",graphqlHTTP({
      schema : authenticationSchema,
      graphiql : true
    }))
    
  app.use("/api/auth", toNodeHandler(auth));

app.listen(port, () => {
    console.log(`Better Auth app listening on port ${port}`);
});