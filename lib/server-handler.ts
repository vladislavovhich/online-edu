import { Socket } from "node:net";
import { Readable } from "node:stream";
import { Request } from "./request/request";
import { RequestRead } from "./types/request.types";

export class ServerHandler {
    public static async read(socket: Socket) {
        const result = await new Promise<RequestRead>((resolve, reject) => {
            let message = Buffer.alloc(0);
            let isHeadersRead = false;
            let isBodyReading = false;
            let length = 0;
            let headers: Record<string, string> = {};
            let rawHeaders = "";

            socket.on("readable", () => {
                if (socket.readableLength === 0) {
                    return;
                }

                if (isBodyReading) {
                    message = Buffer.concat([message, this.readBody(socket)]);
                    if (message.length >= length) {
                        isBodyReading = false;

                        resolve({ headers, body: message, raw: rawHeaders });
                    }
                } else if (!isHeadersRead) {
                    while (!isHeadersRead) {
                        if (message.toString().includes("\r\n\r\n")) {
                            isHeadersRead = true;
                            break;
                        }

                        const chunk = socket.read(1);

                        if (!chunk) {
                            isHeadersRead = true;
                            break;
                        }

                        message = Buffer.concat([message, chunk]);
                    }

                    rawHeaders = message.toString();
                    headers = Request.parseHeaders(rawHeaders);
                    length = +headers["Content-Length"];

                    if (length) {
                        isBodyReading = true;

                        message = this.readBody(socket);

                        if (message.length >= length) {
                            resolve({
                                headers,
                                body: message,
                                raw: rawHeaders,
                            });
                        } else {
                            isBodyReading = true;
                        }
                    } else {
                        resolve({ headers, body: null, raw: rawHeaders });
                    }
                }
            });

            socket.on("error", () => {
                reject();
            });
        });

        return result;
    }

    public static readBody(socket: Socket) {
        let chunk;
        let message = Buffer.alloc(0);

        while ((chunk = socket.read(socket.readableLength))) {
            message = Buffer.concat([message, chunk]);
        }

        return message;
    }

    public static send(data: Buffer, socket: Socket) {
        return new Promise<void>((resolve, reject) => {
            const stream = new Readable({
                highWaterMark: 64 * 1024,
                read(size) {
                    if (data.length > 0) {
                        const chunk = data.slice(0, size);
                        data = data.slice(size);
                        this.push(chunk);
                    } else {
                        this.push(null);
                    }
                },
            });

            stream.on("data", (data) => {
                socket.write(data);
            });

            stream.on("end", () => {
                resolve();
            });

            stream.on("error", () => {
                reject();
            });
        });
    }
}
