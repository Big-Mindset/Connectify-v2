

import { validate } from "graphql"
import { validate_user } from "../../lib/validate_user.js"
import { fieldsMap } from "graphql-fields-list"
import { encryptGroupKey } from "../../security-e2ee/Asymmentric-encryption.js"
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




export let create_message = async (_ , args , ctx ,info)=>{
    let keyvalues = fieldsMap(info)
    flipValues(keyvalues)
    validate_user(ctx.user)
    let prisma = ctx.prisma
    let {media , status , ...rest} = keyvalues
    let newMessage = await prisma.message.create({
        data : {
            ...args, senderId : ctx.user.id,
            
        },
        select : {
            ...rest,media : {
                select : media
            },
            status : {
                select : status
            }
        }
    })
    if (newMessage.id){
        return newMessage
        
    }
}

export let create_group = async (parent , args , ctx , info)=>{
    console.log(args.participants.map((user)=>({
                      role : user.role,
                      userId : user.userId,

                })))
    validate_user(ctx.user)
    let prisma = ctx.prisma
    let createGroup =  await prisma.groupChat.create({
        data : {
            name : args.name,
            description : args.description || "",
            participants : {
                create : args.participants.map((user)=>({
                      role : user.role,
                      userId : user.userId,

                }))
            }
        },
        select : {
            participants : {
                include : true
            }
        }
    })
    console.log(createGroup)
}