"use server"

import { client } from "@/lib/redis"


export const getPeerId = async (userIds)=>{
    let ids = []
    for (let id of userIds){
        ids.push(peerId)
    }
    return ids
}