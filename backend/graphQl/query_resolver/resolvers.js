
import { fieldsMap } from 'graphql-fields-list'
import { validate_user } from '../../lib/validate_user.js'
import { GraphQLObjectType } from 'graphql'


let flipValues = (object) => {
    let keys = Object.keys(object)
    keys.forEach((key) => {
        let val = object[key]
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            flipValues(val)
        } else {
            object[key] = true

        }
    })

}





export let friends_resolver = async (_, args, ctx, info) => {
    validate_user(ctx.user)
    let userId = ctx.user.id
    let keyvalues = fieldsMap(info)
    flipValues(keyvalues)
    let prisma = ctx.prisma

    let bothUsers = await prisma.friendship.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        },
        orderBy: {
            createdAt: "desc"
        },
        select: {
            id: true,
            user1: {
                select: keyvalues.friend_user
            },
            user2: {
                select: keyvalues.friend_user

            }
        }
    })

    let friendUser = bothUsers.map((user) => {
        let friendUser;
        if (user.user1.id === userId) {
            friendUser = user?.user2
        } else {
            friendType = user?.user1
        }
        return { id: user.id, friend_user: friendUser }
    })
    return friendUser

}



export let chat_resolver = async (_, args, ctx, info) => {
    validate_user(ctx.user)
    let keyvalues = fieldsMap(info)
    let prisma = ctx.prisma
    flipValues(keyvalues)
    let {messages , participants , ...rest} = keyvalues
    let Chat_Info =  await prisma.chat.findUnique({
        where: {
            friendshipId: args.friendshipId,
        },
        select: {
            ...rest,
            messages : {
                select : keyvalues.messages
            },
            participants : {
                select : keyvalues.participants
            }
        }
    })
    return Chat_Info

}





// {
//   input: [Object: null prototype] {
//     name: 'Best',
//     participants: [ [Object: null prototype] ]     
//   }
// }