import { GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";

export let media_Args = new GraphQLInputObjectType({
    name: "media_args",
    description: "media including user images , videoes and voice",
    fields: () => ({
        size: { type: GraphQLInt },
        filename: { type: GraphQLString },
        type: { type: GraphQLString },
        url: { type: new GraphQLNonNull(GraphQLString) },
        messageId: { type: GraphQLString },
        groupMessageId: { type: GraphQLString },
    })
})

export let status_Args = new GraphQLInputObjectType({
    name: "status_args",
    description: "media including user images , videoes and voice",
    fields: () => ({
    readAt : {type : GraphQLString},
    deliveredAt : {type : GraphQLString},
    status : {type : GraphQLString},
    messageId : {type : new GraphQLNonNull(GraphQLString) }
    })
})

export let groupParticipant_Args = new GraphQLInputObjectType({
    name : "groupParticipant_Args",
    description : "Member of a group", 
    fields : ()=>({
        role : {type : new GraphQLNonNull(GraphQLString)},
        userId : {type : new GraphQLNonNull(GraphQLString)},
    })
})



export let groupChat_Args = {
        name : {type : new GraphQLNonNull(GraphQLString)},
        description : {type : GraphQLString},
        media : {type : media_Args},
        participants : {type : new GraphQLList(groupParticipant_Args)}
    }
