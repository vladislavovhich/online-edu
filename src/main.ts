import { Router } from "../lib/request/router";
import { SocketServer } from "../lib/server";
import { init } from "../src/auth/auth.router"

const start = async (port: number) => {
    const authRouter = await init()

    const router = Router.combine([
        authRouter
    ])
    
    const server = new SocketServer(router)
    
    server.start(port)
}

start(8080)