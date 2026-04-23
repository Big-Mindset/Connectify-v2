import z from "zod";

export let signIn = z.object({
    email : z.string().trim().min(1,{message : "email is required"}).regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Invalid email format"
  ),
    password : z.string().min(5 , {message : "must be greater or equal to 5 characters"}),
})
export let signUp = z.object({
    email : z.string().trim().min(1,{message : "Enter email"}).regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Invalid email format"
  ),
    password : z.string().min(5 , {message : "must be greater or equal to 5 characters"}),
    name : z.string().min(1,{message : "name is required"}).max(50,{message : "Exceeded max characters of 50"}),
    username : z.string().min(3,{message : "username must be greater than 3 characters"}).regex(/^[a-zA-Z0-9_.]+$/,{message : "please use letters, numbers, underscores_ and periods."})

})

export let emailSchema = z.object({
  email : z.string().trim().min(1,{message : "email is required"}).regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Invalid email format"
  )
})

export let resetPassword = z.object({
  password : z.string().min(6,{message : "Can't be shorter than 4 characters"}).max(50,{message : "Password must be 50 or less characters"}),
  confirmPassword : z.string().min(6,{message : "Can't be shorter than 4 characters"}).max(50,{message : "Password must be 50 or less characters"})
}).refine(data=>data.password === data.confirmPassword,{
    message : "Password doesn't match with confirmation password",
    path : ["password"]
  })