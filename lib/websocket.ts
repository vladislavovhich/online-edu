import crypto from "crypto";
import net from "net";
import { WsClient } from "./types/ws.types";
import { v4 as uuidv4 } from "uuid";

export class WS {
    private static clients: WsClient[] = [];

    public static handle(
        socket: net.Socket,
        key: string,
        cb: (data: string, ws: WsClient) => void
    ) {
        const id = uuidv4();
        const ws = { id, socket };

        this.handshake(key, socket);
        this.clients.push(ws);
        this.sendById(id, JSON.stringify({ id }));

        socket.on("data", (data: Buffer) => {
            const message = this.decodeWebSocketMessage(data);

            cb(message, ws);
        });

        socket.on("close", () => {
            this.clients = this.clients.filter((ws) => ws.id != id);
        });

        socket.on("error", () => {
            this.clients = this.clients.filter((ws) => ws.id != id);
        });
    }

    public static sendAll(message: string) {
        for (let ws of this.clients) {
            ws.socket.write(message);
        }
    }

    public static sendByIds(ids: string[], message: string) {
        for (let id of ids) {
            this.sendById(id, message);
        }
    }

    public static sendById(id: string, message: string) {
        const ws = this.clients.find((ws) => ws.id === id);

        if (!ws) {
            throw new Error("Socket not found!");
        }

        this.send(message, ws.socket);
    }

    public static send(data: string, socket: net.Socket) {
        const message = this.encodeWebSocketMessage(data);

        socket.write(message);
    }

    public static generateAcceptValue(key: string) {
        return crypto
            .createHash("sha1")
            .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`, "binary")
            .digest("base64");
    }

    public static handshake(key: string, socket: net.Socket) {
        const acceptKey = this.generateAcceptValue(key);

        const responseHeaders = [
            "HTTP/1.1 101 Switching Protocols",
            "Upgrade: websocket",
            "Connection: Upgrade",
            `Sec-WebSocket-Accept: ${acceptKey}`,
            "\r\n",
        ].join("\r\n");

        socket.write(responseHeaders);
    }

    public static decodeWebSocketMessage(buffer: Buffer) {
        const secondByte = buffer[1];
        const dataLength = secondByte & 127;
        let dataStartIndex = 2;

        if (dataLength === 126) {
            dataStartIndex = 4;
        } else if (dataLength === 127) {
            dataStartIndex = 10;
        }

        const maskingKey = buffer.slice(dataStartIndex, dataStartIndex + 4);
        const data = buffer.slice(dataStartIndex + 4);

        const decoded = data.map((byte, i) => byte ^ maskingKey[i % 4]);
        return decoded.toString();
    }

    public static encodeWebSocketMessage(message: string) {
        const messageBuffer = Buffer.from(message);
        const length = messageBuffer.length;
        let payload;

        if (length < 126) {
            payload = Buffer.alloc(2 + length);
            payload[1] = length;
        } else if (length < 65536) {
            payload = Buffer.alloc(4 + length);
            payload[1] = 126;
            payload.writeUInt16BE(length, 2);
        } else {
            payload = Buffer.alloc(10 + length);
            payload[1] = 127;
            payload.writeUInt32BE(0, 2);
            payload.writeUInt32BE(length, 6);
        }

        payload[0] = 0x81;

        messageBuffer.copy(payload, payload.length - length);

        return payload;
    }
}
