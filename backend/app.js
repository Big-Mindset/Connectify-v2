
import express from "express"
import cookieParser from "cookie-parser";
import logger from "morgan";
import friendRequest from "./routes/friend-request.js"
import cors from "cors"
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import chatRouter from "./routes/chat.js";
import messageRouter from "./routes/message.js";
import groupRouter from "./routes/group.js";
var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(cors({
  credentials: true,
  methods: ["POST", "GET", "DELETE", "PUT"],
  origin: "http://localhost:3000",
}))

// app.use(express.static(path.join(__dirname, 'public')));

app.all("/api/auth/*", toNodeHandler(auth));
app.use('/friendship', friendRequest);
app.use('/chat',chatRouter)
app.use("/message",messageRouter)
app.use("/group",groupRouter)


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
// console.log(friendRequest)

//   next(createError(404));
// });

app.use(function(err, req, res, next) {
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(req.app.get('env') === 'development' && { stack: err.stack })
  });
});

export default app