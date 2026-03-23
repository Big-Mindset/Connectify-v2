

import {GraphQLObjectType, GraphQLNonNull, GraphQLString,GraphQLBoolean,GraphQLInt} from "graphql"



let userType = new GraphQLObjectType({
    name : "userData",
    fields : ()=>({
    id: { type: new GraphQLNonNull(GraphQLString) },     
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },  
    emailVerified: { type: GraphQLBoolean },                
    image: { type: GraphQLString },                        
    createdAt: { type: GraphQLString },                   
    updatedAt: { type: GraphQLString },                      
    bio: { type: GraphQLString },                          
    username: { type: GraphQLString },                    
    displayUsername: { type: GraphQLString },               
    lastSeen: { type: GraphQLString },
    })
})
const SessionType = new GraphQLObjectType({
  name: "Session",
  fields:()=>({

      id: { type: new GraphQLNonNull(GraphQLString) },       
      expiresAt: { type: GraphQLString },                     
      token: { type: GraphQLString },                       
      createdAt: { type: GraphQLString },                  
      updatedAt: { type: GraphQLString },                  
      ipAddress: { type: GraphQLString },                    
      userAgent: { type: GraphQLString },                     
      userId: { type: new GraphQLNonNull(GraphQLString) },    
      
    })
})

export const AuthSessionType = new GraphQLObjectType({
  name: "AuthSession",
  fields: {
    user: { type: userType },
    session: { type: SessionType }
  }
})

export let authType = new GraphQLObjectType({
    name : "AuthType",
    fields : ()=>({
        message : {type : GraphQLString},
        statusCode : {type : GraphQLInt}
    })
})