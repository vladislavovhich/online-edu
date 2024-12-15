import net from "net";
import { Request } from "./request/request";
import { Router } from "./request/router";
import { Response } from "./response/response";
import { ContentType, HttpStatus } from "./types/response.types";
import { HttpError } from "./errors/http-common.error";
import fs from "node:fs";
import path from "node:path";
import * as tls from "tls";
import { ServerHandler } from "./server-handler";

export class SocketServer {
    constructor(public readonly router: Router) {}

    public printRoutes() {
        for (let route of this.router.routes) {
            let zerosAmount = 6 - route.method.length + 2;

            console.log(
                `[${route.method}]${" ".repeat(zerosAmount)} ${route.url}`
            );
        }
    }

    public start(port: number) {
        const options = {
            key: fs.readFileSync(
                "C:\\Users\\vladi\\Documents\\nodejspr\\online-edu\\online-edu\\cert\\server.key"
            ),
            cert: fs.readFileSync(
                "C:\\Users\\vladi\\Documents\\nodejspr\\online-edu\\online-edu\\cert\\server.crt"
            ),
            requestCert: false,
            rejectUnauthorized: false,
        };

        const server = tls.createServer(options, async (socket) => {
            try {
                const { headers, body, raw } = await ServerHandler.read(socket);
                const request = Request.parse(headers, body, raw);

                const response = await this.router.handle(request);

                await ServerHandler.send(response, socket);
            } catch (exception: unknown) {
                const response = new Response();

                let data: Buffer;

                if (exception instanceof HttpError) {
                    data = response.text(
                        exception.statusCode,
                        exception.message
                    );
                } else if (exception instanceof Error) {
                    data = response.text(
                        HttpStatus.BAD_REQUEST,
                        `${exception.message}, ${exception.stack}`
                    );
                } else {
                    data = response.text(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Some error occured..."
                    );
                }

                await ServerHandler.send(data, socket);
            } finally {
                socket.end();
            }
        });

        server.listen(port);
    }
}
