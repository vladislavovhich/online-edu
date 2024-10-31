import net from "net"
import { Request } from './request/request';
import { Router } from './request/router';
import { Response } from './response/response';
import { HttpStatus } from './types/response.types';
import { HttpError } from './errors/http-common.error';

export class SocketServer {
    constructor(
        public readonly router: Router
    ) {}

    public printRoutes() {
        for (let route of this.router.routes) {
            let zerosAmount = 6 - route.method.length + 2

            console.log(`[${route.method}]${" ".repeat(zerosAmount)} ${route.url}`)
        }
    }

    public start(port: number) {
        const server = net.createServer((socket) => {
            socket.on("data", async (data) => {
                try {
                    const requestData = data.toString()

                    const request = Request.parse(requestData)
                    const response = await this.router.handle(request)
                
                    socket.write(response)
                    socket.end()
                } catch (exception: unknown) {
                    const response = new Response()
                    
                    let responseText = ""

                    if (exception instanceof HttpError) {
                        responseText = response.text(exception.statusCode, exception.message)
                    }
                    else if (exception instanceof Error) {     
                        responseText = response.text(HttpStatus.BAD_REQUEST, `${exception.message}, ${exception.stack}`);
                    } else {
                        responseText = response.text(HttpStatus.INTERNAL_SERVER_ERROR, "Some error occured...");
                    }
                    
                    socket.write(responseText)
                    socket.end()
                } 
            })

            socket.on("error", (err) => {
                console.error(`Ошибка сокета: ${err.message}`);
            });
        })
        
        server.listen(port)
    }
}