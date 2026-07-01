
import express from "express"
import cookieParser from "cookie-parser";
import logger from "morgan";
import friendRequest from "./routes/friend-request.js"
import {createServer} from "node:http"
import { auth } from "./lib/services/auth.js";
import cors from "cors"
import { toNodeHandler } from "better-auth/node";
import chatRouter from "./routes/chat.js";
import { Server } from "socket.io";
import messageRouter from "./routes/message.js";
// import {ExpressPeerServer } from "peer"
import groupRouter from "./routes/group.js";
import userRouter from "./routes/user.js";
import { SocketConnection } from "./lib/socket-class.js";
import { instrument } from "@socket.io/admin-ui";
import {rateLimit , ipKeyGenerator} from "express-rate-limit"

var app = express();
let server = createServer(app)
app.use(cors({
credentials : true,
origin  : "http://localhost:3000"
}))
let io  = new Server(server,{
  cors : {
     credentials: true,
  methods: ["POST", "GET", "DELETE", "PUT"],
  origin: ["http://localhost:3000","https://admin.socket.io"],
  
  }
})

// view engine setup
// app.set('views', path.join(__dirname, 'views'));

// let peerServer = ExpressPeerServer(server)

// app.use("/peerjs", peerServer);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const globalRateLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  limit : 100,
  message : {
    error : "Too many attempts, wait a moment"
  },
})
const loginRateLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  keyGenerator : (req)=>req.body.email || ipKeyGenerator(req),
  
  limit : 15,
  message : {
    error : "Too many login attempts, wait a moment"
  },
})

const passwordResetLimitter = rateLimit({
  windowMs : 60 * 60 * 1000,
  limit : 5,
  message : {
    error : "Too many password reset attempts, wait a moment"
  },
})

// app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/auth/sign-in/email",loginRateLimiter)
app.use("/api/auth/request-password-reset",passwordResetLimitter)
app.all("/api/auth/*", toNodeHandler(auth));
app.use('/friendship',globalRateLimiter, friendRequest);
app.use('/chat',globalRateLimiter,chatRouter)
app.use("/message",messageRouter)
app.use("/group",globalRateLimiter,groupRouter)
app.use("/user",globalRateLimiter,userRouter)
    

let Socket = new SocketConnection(io)
instrument(io,{
auth :false
})
io.on("connection",async (socket)=>{
  
  

  Socket.handleConnection(socket)
  // socket.on("register-peer-socket",async (peerId)=>{
  //   Socket.RegisterPeerConnection(socket, peerId)
  // })

  socket.on("friend-request", (payload)=>{
 
    socket.to(payload.userId).emit("friend-request",payload)
    
  })
  socket.on("reject-cancel-request",(data)=>{
    socket.to(data.userId).emit("reject-cancel-request",data)
  })
  socket.on("accept-request",(data)=>{
    socket.to(data.userId).emit("accept-request",data)
  })

  socket.on("group-created",(data)=>{
    Socket.handleGroupCreated(socket , data)
  })


  socket.on("join-chat",async (chatId)=>{
     Socket.handleJoinChat(socket , chatId)
  })
  socket.on("leave-chat",(chatId)=>{
    Socket.handleLeaveChat(socket , chatId)
  })
  socket.on("heartbeat",()=>{
    Socket.handleHeartbeat(socket)
  })

  socket.on("send-message", async (message)=>{
    Socket.handleSendMessage(socket ,message)
  })
  socket.on("typing",(data)=>{
    Socket.handleTyping(socket,data , "typing")
  })
  socket.on("stop-typing",(data)=>{
    Socket.handleTyping(socket ,data , "stop-typing")
  })
  socket.on("message-delivered" , (data)=>{
    
    Socket.handleMessageDelivered(socket , data)
  })
  socket.on("message-deliverd-all",()=>{
    Socket.handleMessageDeliveredAll(socket)
  })
  socket.on("message-read",(data)=>{
    Socket.handleMessageRead(socket , data)
  })
  socket.on("mark-asRead",(statusData)=>{
   Socket.markAllAsRead(socket , statusData)

  })
  socket.on("delete-message",(message)=>{
    Socket.handleDeleteMessage(socket ,message)
  })
  socket.on("reaction-updates",(data , chatId)=>{
    Socket.handleReactionUpdates(socket,data,chatId)
  })


  

  socket.on("disconnect",async ()=>{

      Socket.handleDisconnection(socket)

  })
})


app.use(function(err, req, res, next) {
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(req.app.get('env') === 'development' && { stack: err.stack })
  });
});


  

server.listen(2525,async ()=>{
 
  console.log("listening to port")
})