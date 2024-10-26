import { Router } from "../lib/request/router";
import { SocketServer } from "../lib/server";
import { createAuthRouter } from "../src/auth/auth.router"
import { createCourseRouter } from "./course/course.router";
import { createGroupRouter } from "./group/group.router";
import { createMessageRouter } from "./message/message.router";
import { createUserRouter } from "./user/user.router";

const start = async (port: number) => {
    const authRouter = await createAuthRouter()
    const courseRouter = await createCourseRouter()
    const userRouter = await createUserRouter()
    const groupRouter = await createGroupRouter()
    const messageRouter = await createMessageRouter()

    const router = Router.combine([
        authRouter,
        courseRouter,
        userRouter,
        messageRouter,
        groupRouter,
    ])
    
    const server = new SocketServer(router)
    
    server.start(port)
}

start(8080)