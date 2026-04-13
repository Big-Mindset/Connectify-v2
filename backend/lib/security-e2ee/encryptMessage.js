import crypto, { createCipheriv, createDecipheriv, createHmac } from "crypto"



export class secure_message {
    constructor(kek) {
        this.kek_key = kek
    }
    encryptMessage(content) {

        const dek_key = crypto.randomBytes(32)
        const iv = crypto.randomBytes(16)

        const cipher = createCipheriv("aes-256-gcm", dek_key, iv)
        let encrypteContent;
        let ngrams;
        if (content) {

            encrypteContent = cipher.update(content, "utf8", "hex") + cipher.final("hex")
            ngrams = this.content_ngrams(content , true , true)
   
        }

        let authTag = cipher.getAuthTag()
        let v1Keys = {
            vi_v1: iv.toString("hex"),
            authTag_v1: authTag.toString("hex"),
        }

        let v2Keys = this.encryptDekWithKek(dek_key)
        let keys = {
            ...v1Keys, ...v2Keys
        }
        return {
            keys,
            encrypteContent,
            firstLetters_search : ngrams.n_grams_singleLetters,
            letters_search : ngrams.n_grams  
        }
    }
    decryptMessage(encryptedContent, keys) {
        let decryptedDek = this.decryptDekKey({
            vi_v2: keys.vi_v2,
            authTag_v2: keys.authTag_v2,
            ecnryptedDek: keys.encryptedDek

        })
        let decipher = createDecipheriv("aes-256-gcm", decryptedDek, keys.vi_v1)
        decipher.setAuthTag(Buffer.from(keys.authTag_v1, "hex"))
        let decryptedContent = decipher.update(encryptedContent, "hex", "utf-8") + decipher.final("utf8")
        return decryptedContent

    }
    decryptDekKey(keys) {
        let decipher = createDecipheriv("aes-256-gcm", this.kek_key, keys.vi_v2)      
        decipher.setAuthTag(Buffer.from(keys.authTag_v2, "hex"))
        let decryptedDek = decipher.update(keys.ecnryptedDek, "hex", "utf-8") + decipher.final("utf8")
        return decryptedDek
    }
    // encryptMedia(data){
    //     //  const dek_key = crypto.randomBytes(32)
    //     // const iv = crypto.randomBytes(16)
    //     // const cipher = createCipheriv("aes-256-gcm",dek_key,iv)
    //     // let encryptedMedia = cipher.update(JSON.stringify(data) , "utf8" , "hex") + cipher.final("hex")
    //     // let encryptedKeys = this.encryptDekWithKek(dek_key)
    //     // return {
    //     //     encryptedMedia,
    //     //     ...encryptedKeys,

    //     // }
    // }
    encryptDekWithKek(dek_key) {

        const iv = crypto.randomBytes(16)
        const cipher = createCipheriv("aes-256-gcm", this.kek_key, iv)
        const encryptedDek = cipher.update(dek_key, "utf8", "hex") + cipher.final("hex")
        let authTag = cipher.getAuthTag()
        return {
            authTag_v2: authTag.toString("hex"), vi_v2: iv.toString("hex"), encryptedDek
        }
    }
    content_ngrams(content , gin , binaryTree) {
        let normalizeText = content.toLowerCase().trim().split(" ")
        let n_grams = new Map()
        let first_letters_ngrams = new Map()
        for (let word of normalizeText) {
            if (binaryTree){

                let firstLetter = word[0]
                let hashedFirstLetter = createHmac("sha256", this.kek_key).update(firstLetter).digest("hex").slice(0, 16)
                if (!first_letters_ngrams.has(firstLetter)) {
                    first_letters_ngrams.set(firstLetter, hashedFirstLetter)
                }
            }
            if (gin){

                let val = word[0]
                for (let i = 1; i < word.length; i++) {
                    val += word[i]
                    if (!n_grams.has(val)) {
                        let hashedValue = createHmac("sha256", this.kek_key).update(val).digest("hex").slice(0, 16)
                        n_grams.set(val, hashedValue)
                    }
                }
            }
        }
        return {
            n_grams: [...n_grams.values()],
            n_grams_singleLetters: [...first_letters_ngrams.values()]
        }
    }


}

