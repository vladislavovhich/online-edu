import * as tls from 'tls';
import * as fs from 'fs';
import { Request } from './request/request';
import { Router } from './request/router';
import { Response } from './response/response';
import { HttpStatus } from './types/response.types';
import { HttpError } from './errors/http-common.error';

export class SocketServer {
    constructor(
        public readonly router: Router
    ) {}

    public start(port: number) {
        const options: tls.TlsOptions = {
            key: fs.readFileSync("./lib/certificate/server.key"),
            cert: fs.readFileSync("./lib/certificate/server.cert"),
        }

        const server = tls.createServer(options, (socket) => {
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
                    if (exception instanceof Error) {     
                        responseText = response.text(HttpStatus.BAD_REQUEST, exception.message);
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