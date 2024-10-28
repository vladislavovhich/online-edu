import { Cookie } from "./cookie";
import { ContentType, HttpStatus, HttpStatusMessages} from "../types/response.types";

export class Response {
    private cookies: Cookie[] = []

    setCookie(name: string, value: string, options: Record<string, any>) {
        this.cookies.push(new Cookie(name, value, options))

        return this
    }

    removeCookie(name: string) {
        this.cookies = this.cookies.filter(cookie => cookie.name != name)
        this.cookies.push(new Cookie(name, '', {"Max-Age": "0", "path": "/"}))

        return this
    }

    public json(statusCode: HttpStatus, body: object) {
        const json = JSON.stringify(body)

        return this.make(ContentType.JSON, statusCode, json)
    }

    public text(statusCode: HttpStatus, body: string) {
        return this.make(ContentType.TEXT, statusCode, body)
    }

    public cors() {
        const headers = [
            `HTTP/1.1 200 OK`,
            'Access-Control-Allow-Origin: http://localhost:3000',
            'Access-Control-Allow-Methods: POST, GET, OPTIONS, PATCH, PUT, DELETE',
            'Access-Control-Allow-Headers: X-PINGOTHER, Content-Type',
            'Access-Control-Max-Age: 86400',
            'Access-Control-Allow-Credentials: true',
            'Vary: Accept-Encoding, Origin',
            'Keep-Alive: timeout=2, max=100',
            'connection: keep-alive',
            'Content-Type: text/plain',
        ].join("\r\n");
    
        return headers;
    }

    private make(contentType: ContentType, statusCode: HttpStatus, body: string) {
        const message = HttpStatusMessages[statusCode]
        const headers = [
            `HTTP/1.1 ${statusCode} ${message}`,
            `Content-Type: ${contentType}`,
            `Content-Length: ${body.length}`,
            'Connection: close',
            'Access-Control-Allow-Origin: http://localhost:3000',
            'Access-Control-Allow-Credentials: true',
            ...(this.cookies.length > 0 ? this.cookies.map(cookie => `Set-Cookie: ${cookie.toHeader()}`) : []),
            ``,
            body
        ].join("\r\n")

        return headers
    }
}