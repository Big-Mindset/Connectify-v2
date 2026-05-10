
import express from "express"
import cookieParser from "cookie-parser";
import logger from "morgan";
import friendRequest from "./routes/friend-request.js"
import {createServer} from "node:http"
import { auth } from "./lib/auth.js";
import cors from "cors"
import { toNodeHandler } from "better-auth/node";
import chatRouter from "./routes/chat.js";
import { Server } from "socket.io";
import messageRouter from "./routes/message.js";
import {ExpressPeerServer } from "peer"
import groupRouter from "./routes/group.js";
import { client } from "./lib/redis.js";
import userRouter from "./routes/user.js";
import { prisma } from "./prismaClient.js";
import { SocketConnection } from "./lib/socket-class.js";
import { instrument } from "@socket.io/admin-ui";
import multer from "multer";
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

let peerServer = ExpressPeerServer(server)

app.use("/peerjs", peerServer);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




// app.use(express.static(path.join(__dirname, 'public')));

app.all("/api/auth/*", toNodeHandler(auth));
app.use('/friendship', friendRequest);
app.use('/chat',chatRouter)
app.use("/message",messageRouter)
app.use("/group",groupRouter)
app.use("/user",userRouter)

    

let Socket = new SocketConnection(io)
instrument(io,{
auth :false
})
io.on("connection",async (socket)=>{
  Socket.handleConnection(socket)
  // socket.on("register-peer-socket",async (peerId)=>{
  //   Socket.RegisterPeerConnection(socket, peerId)
  // })
  socket.on("join-chat",async (chatId)=>{
    socket.join(chatId)
  })
  socket.on("send-message", async (message , participantIds)=>{
    Socket.handleSendMessage(socket , message , participantIds)
    
    
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


  

server.listen(2525,()=>{
  console.log("listening to port")
})