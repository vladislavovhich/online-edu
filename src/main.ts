import { Router } from "../lib/request/router";
import { SocketServer } from "../lib/server";
import { createAuthRouter } from "../src/auth/auth.router"
import { createCourseRouter } from "./course/course.router";

const start = async (port: number) => {
    const authRouter = await createAuthRouter()
    const courseRouter = await createCourseRouter()

    const router = Router.combine([
        authRouter,
        courseRouter
    ])
    
    const server = new SocketServer(router)
    
    server.start(port)
}

start(8080)