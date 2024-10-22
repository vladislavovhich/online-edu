import { Cookie } from "./cookie";
import { ContentType, HttpStatus, HttpStatusMessages} from "../types/response.types";

export class Response {
    private cookies: Cookie[] = []

    setCookie(name: string, value: string, options: Record<string, string>) {
        this.cookies.push(new Cookie(name, value, options))

        return this
    }

    removeCookie(name: string) {
        this.cookies = this.cookies.filter(cookie => cookie.name != name)
        this.cookies.push(new Cookie(name, '', {"Max-Age": "0", "Path": "/"}))

        return this
    }

    public json(statusCode: HttpStatus, body: string) {
        return this.make(ContentType.JSON, statusCode, body)
    }

    public text(statusCode: HttpStatus, body: string) {
        return this.make(ContentType.TEXT, statusCode, body)
    }

    private make(contentType: ContentType, statusCode: HttpStatus, body: string) {
        const message = HttpStatusMessages[statusCode]
        const headers = [
            `HTTP/1.1 ${statusCode} ${message}`,
            `Content-Type: ${contentType}`,
            `Content-Length: ${body.length}`,
            'Connection: close',
            ...(this.cookies.length > 0 ? this.cookies.map(cookie => `Set-Cookie: ${cookie.toHeader()}`) : []),
            ``,
            body
        ].join("\r\n")

        return headers
    }
}