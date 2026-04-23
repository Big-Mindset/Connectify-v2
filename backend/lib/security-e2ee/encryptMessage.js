import crypto, { createCipheriv, createDecipheriv, createHmac } from "crypto"



export class secure_message {
    constructor(kek) {
        this.kek_key = kek
    }
    encryptMessage(content) {

        const dek_key = crypto.randomBytes(32)
        const iv = crypto.randomBytes(12)

        const cipher = createCipheriv("aes-256-gcm", dek_key, iv)
        let encrypteContent;
        let ngrams;
        if (content) {
            let encryptedBuffer = Buffer.concat([cipher.update(content , "utf8") , cipher.final()])
            
            encrypteContent = encryptedBuffer.toString("hex")
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
            encryptedDek: keys.encryptedDek

        })
        let decipher = createDecipheriv("aes-256-gcm", decryptedDek, Buffer.from(keys.vi_v1 , "hex"))
        decipher.setAuthTag(Buffer.from(keys.authTag_v1, "hex"))
      
        let decryptedContent = Buffer.concat([
            decipher.update(Buffer.from(encryptedContent , "hex")) , 
            decipher.final()
        ]).toString("utf8")
        return decryptedContent

    }
    decryptDekKey(keys) {
        let decipher = createDecipheriv("aes-256-gcm", this.kek_key, Buffer.from(keys.vi_v2 , "hex"))      
        decipher.setAuthTag(Buffer.from(keys.authTag_v2, "hex"))
        let decryptedDek = Buffer.concat([decipher.update(Buffer.from(keys.encryptedDek , "hex")) ,decipher.final()] ) 
        return decryptedDek
    }
  
    encryptDekWithKek(dek_key) {

        const iv = crypto.randomBytes(12)
        const cipher = createCipheriv("aes-256-gcm", this.kek_key, iv)
        const encryptedDek = Buffer.concat([cipher.update(dek_key) , cipher.final()])  
        let authTag = cipher.getAuthTag()
        return {
            authTag_v2: authTag.toString("hex"), vi_v2: iv.toString("hex"), encryptedDek : encryptedDek.toString("hex")
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

