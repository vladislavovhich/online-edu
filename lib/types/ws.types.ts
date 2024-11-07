import net from "net";

export type WsClient = {
    socket: net.Socket;
    id: string;
};
