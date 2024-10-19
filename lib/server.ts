import * as tls from 'tls';
import * as fs from 'fs';
import { Request } from './request';
import { Router } from './router';

export class SocketServer {
    constructor(
        public readonly router: Router
    ) {}

    public start() {
        const options = {
            key: fs.readFileSync("./lib/certificate/server.key"),
            cert: fs.readFileSync("./lib/certificate/server.cert")
        }

        const server = tls.createServer(options, (socket) => {
            socket.on("data", (data) => {
                const requestData = data.toString()
                const request = Request.parse(requestData)

                this.router.handle(request)
            })
        })
        
        server.listen(443)
    }
}