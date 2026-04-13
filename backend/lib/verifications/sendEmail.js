import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.API_KEY,
});

export const SendEmail = async (data)=>{
try{
    
    const sentFrom = new Sender("MS_0nqCFg@test-vz9dlem76vq4kj50.mlsender.net", "Connectify");
    
    const recipients = [
        new Recipient(data.to, data.recipient)
    ];
    
    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(data.subject)
    .setHtml(data.html)
    await mailerSend.email.send(emailParams);
}catch(error){
    console.log(error)
}
  
}