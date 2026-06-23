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
            let encryptedBuffer = Buffer.concat([cipher.update(content, "utf8"), cipher.final()])

            encrypteContent = encryptedBuffer.toString("hex")
            ngrams = this.content_ngrams(content)

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
            letters_search: ngrams.n_grams
        }
    }
    decryptMessage(encryptedContent, keys) {
        let decryptedDek = this.decryptDekKey({
            vi_v2: keys.vi_v2,
            authTag_v2: keys.authTag_v2,
            encryptedDek: keys.encryptedDek

        })
        let decipher = createDecipheriv("aes-256-gcm", decryptedDek, Buffer.from(keys.vi_v1, "hex"))
        decipher.setAuthTag(Buffer.from(keys.authTag_v1, "hex"))

        let decryptedContent = Buffer.concat([
            decipher.update(Buffer.from(encryptedContent, "hex")),
            decipher.final()
        ]).toString("utf8")
        return decryptedContent

    }
    decryptDekKey(keys) {
        let decipher = createDecipheriv("aes-256-gcm", this.kek_key, Buffer.from(keys.vi_v2, "hex"))
        decipher.setAuthTag(Buffer.from(keys.authTag_v2, "hex"))
        let decryptedDek = Buffer.concat([decipher.update(Buffer.from(keys.encryptedDek, "hex")), decipher.final()])
        return decryptedDek
    }

    encryptDekWithKek(dek_key) {

        const iv = crypto.randomBytes(12)
        const cipher = createCipheriv("aes-256-gcm", this.kek_key, iv)
        const encryptedDek = Buffer.concat([cipher.update(dek_key), cipher.final()])
        let authTag = cipher.getAuthTag()
        return {
            authTag_v2: authTag.toString("hex"), vi_v2: iv.toString("hex"), encryptedDek: encryptedDek.toString("hex")
        }
    }
    content_ngrams(content) {
        let normalizeText = content.toLowerCase().trim().split(" ")
        let n_grams = new Set()
        for (let word of normalizeText) {
            if (word && word.length > 1) {
                n_grams.add(this.hmac(word))
            }



            for (let i = 1; i <= Math.min(2, word.length - 1); i++) {
                let value = word.slice(0, i)
                n_grams.add(this.hmac(value))
            }
            for (let i = 0; i < word.length - 2; i++) {
                let value = word.slice(i, i + 3)

                let hashedValue = this.hmac(value)
                n_grams.add(hashedValue)

            }

        }
        return {
            n_grams: [...n_grams],
        }
    }
    hmac(text) {
        return createHmac("sha256", this.kek_key).update(text).digest("hex").slice(0, 16)
    }
    transformDecryptData(encryptedText, messageKeys , message) {
        if (!encryptedText) return message
        let content = this.decryptMessage(encryptedText, messageKeys)
        let { encryptedContent, message_security, ...rest } = message
        return  { ...rest, content }
    }


}

