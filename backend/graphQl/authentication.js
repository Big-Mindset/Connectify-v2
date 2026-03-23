

import {GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLInt,GraphQLBoolean} from "graphql"
import { auth } from "../lib/auth.js"
import { AuthSessionType, authType } from "./authTypes.js"



// export let authenticate = new GraphQLObjectType({
    
//     name : "Auth",
//     fields : ()=>({
      

//     })
// })




export let authQueryFields = {
    getSession : {
            type : AuthSessionType,
            resolve : async (__,_,ctx)=>{
                console.log(ctx)
                let session = await auth.api.getSession({
                    headers : ctx.req.headers
                })
                console.log(session)
                if (!session) return null
                return {
                   user :  session.user,
                   session : session.session
                }
            }
        }
    }