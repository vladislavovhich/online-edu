import net from "net";
import { Request } from "./request/request";
import { Router } from "./request/router";
import { Response } from "./response/response";
import { ContentType, HttpStatus } from "./types/response.types";
import { HttpError } from "./errors/http-common.error";
import { WS } from "./websocket";
import { WsClient } from "./types/ws.types";
import fs from "node:fs";
import path from "node:path";
import tls from "node:tls";

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

    public async handleHttpRequest(data: string, socket: net.Socket) {
        try {
            const requestData = data.toString();
            const request = Request.parse(requestData);
            const response = await this.router.handle(request, requestData);

            socket.write(response);
            socket.end();
        } catch (exception: unknown) {
            const response = new Response();

            let responseText = "";

            if (exception instanceof HttpError) {
                responseText = response.text(
                    exception.statusCode,
                    exception.message
                );
            } else if (exception instanceof Error) {
                responseText = response.text(
                    HttpStatus.BAD_REQUEST,
                    `${exception.message}, ${exception.stack}`
                );
            } else {
                responseText = response.text(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Some error occured..."
                );
            }

            socket.write(responseText);
            socket.end();
        }
    }

    public start(port: number) {
        const options = {
            key: fs.readFileSync("cert/server.cert"),
            cert: fs.readFileSync("cert/server.cert"),
            requestCert: false,
            rejectUnauthorized: false,
        };

        console.log(options);

        const server = tls.createServer(options, (socket) => {
            let raw = "";

            socket.on("error", (e) => {
                console.log(e.message);
            });

            socket.on("data", async (data) => {
                try {
                    raw += data.toString();

                    if (data.length < 65536) {
                        const request = Request.parse(raw);
                        const response = await this.router.handle(request, raw);

                        const chunkSize = 65000;
                        let offset = 0;

                        if (raw.length < chunkSize) {
                            socket.write(response);
                            socket.end();
                            return;
                        }

                        const sendChunk = () => {
                            if (offset < response.length) {
                                const chunk = response.slice(
                                    offset,
                                    offset + chunkSize
                                );

                                const success = socket.write(
                                    chunk,
                                    "utf8",
                                    () => {
                                        offset += chunk.length;
                                        if (offset < response.length) {
                                            sendChunk();
                                        } else {
                                        }
                                    }
                                );

                                if (!success) {
                                    socket.once("drain", sendChunk);
                                }
                            }
                        };

                        sendChunk();
                    }
                } catch (exception: unknown) {
                    const response = new Response();

                    let responseText = "";

                    if (exception instanceof HttpError) {
                        responseText = response.text(
                            exception.statusCode,
                            exception.message
                        );
                    } else if (exception instanceof Error) {
                        responseText = response.text(
                            HttpStatus.BAD_REQUEST,
                            `${exception.message}, ${exception.stack}`
                        );
                    } else {
                        responseText = response.text(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Some error occured..."
                        );
                    }

                    socket.write(responseText);
                    socket.end();
                }
            });
        });

        server.listen(port);
    }
}
