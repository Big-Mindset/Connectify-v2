

import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLList } from "graphql"


export let returnType = new GraphQLObjectType({
  name : "successReturn",
  description : "response when there is no error",
  fields : ()=>({
    message : {type : GraphQLString},
    statusCode : {type : GraphQLInt}
  })
})

export let userType = new GraphQLObjectType({
  name: "userData",
  fields: () => ({
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

export let friendType = new GraphQLObjectType({
  name: "friendUser",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString), },
    friend_user: { type: userType, },
  })
})


export let chatType = new GraphQLObjectType({
  name: "chat_info",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    messages: { type: new GraphQLList(messageType) },
    participants: { type: new GraphQLList(ChatparticipantType) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    friendshipId : {type : GraphQLString},
    lastMessage : {type : messageType}
  })
})

let ChatparticipantType = new GraphQLObjectType({
  name : "participant",
  fields : ()=>({
    id: { type: new GraphQLNonNull(GraphQLString) },
    userId : {type : GraphQLString},
    chatId : {type : GraphQLString},

    createdAt  : {type : GraphQLString},
    updatedAt : {type : GraphQLString},
    mutedTil : {type : GraphQLString},
    muted : {type :  GraphQLBoolean}
  })
})

export let messageType = new GraphQLObjectType({
  name: "message",
  description: "message type for bi-directional communication between two users",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    senderId: { type: new GraphQLNonNull(GraphQLString) },
    status : {type : statusType },
    chatId : {type : GraphQLString},
    lastMessage: { type: GraphQLString },
    replyToId: { type: GraphQLString },
    content: { type: GraphQLString },
    replies : {type : new GraphQLList(messageType)},
    media: { type: new GraphQLList(mediaType) },
    createdAt : {type : GraphQLString},
    updatedAt : {type : GraphQLString},
  })
})

let statusType = new GraphQLObjectType({
  name : "status_type",
  description : "status for messages when sent",
  fields : ()=>({
    id : {type : new GraphQLNonNull(GraphQLString)},
    readAt : {type : GraphQLString},
    deliveredAt : {type : GraphQLString},
    status : {type : GraphQLString},
    messageId : {type : new GraphQLNonNull(GraphQLString) }
  })
})







export let mediaType = new GraphQLObjectType({
  name: "media_type",
  description: "media type for images , videoes etc",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    size: { type: GraphQLInt },
    filename: { type: GraphQLString },
    type: { type: GraphQLString },
    url: { type: new GraphQLNonNull(GraphQLString) },
    messageId: { type: GraphQLString },
    groupMessageId: { type: GraphQLString },
  })
})

