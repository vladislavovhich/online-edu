import { BadRequestError } from "../errors/bad-request.error"

export class Request {
    public params: Record<string, string> = {}

    private constructor(
        public readonly url: string, 
        public readonly method: string,
        public readonly headers: string[][],
        public readonly body: Record<string, string> = {},
        public readonly cookie: Record<string, string> = {}
    ) {}

    public static parse(rawRequest: string) {
        const lines = rawRequest.split("\r\n")
        const {url, method} = Request.parseUrl(lines[0])
        const headerEndIndex = lines.indexOf('')
        const headerLines = lines.slice(1, headerEndIndex)

        const headers = Request.processHeaders(headerLines)
        const cookies = Request.parseCookies(headers)
        const body = Request.parseBody(lines, headers)
        
        const request = new Request(url, method, headers, body, cookies)

        return request
    }

    public static parseBody(requestLines: string[], headers: string[][]) {
        try {
            const contentTypeIndex = headers.findIndex(([header, value]) => header == "Content-Type")
        
            if (contentTypeIndex == -1) {
                return {}
            }

            const contentType = headers[contentTypeIndex][1]
            const headerEndIndex = requestLines.indexOf('')

            if (contentType == "application/json") {
                const body = JSON.parse(requestLines.slice(headerEndIndex + 1).join(""))

                return body
            }

            return {}
        } catch (e: unknown) {
            throw new BadRequestError("Can't parse request body...")
        }
    }

    public static parseCookies(headers: string[][]) {
        try 
        {
            const cookies: Record<string, string> = {}

            for (let [header, value] of headers) {
                if (header == "Cookie") {
                    const rawCookies = value.split(";")

                    for (let rawCookie of rawCookies) {  
                        const equalIndex = rawCookie.indexOf("=")
                        const cookieName = rawCookie.slice(0, equalIndex).trim()
                        const cookieVal = rawCookie.slice(equalIndex + 1).trim()

                        cookies[cookieName] = cookieVal
                    }
                }
            }

            return cookies
        }
        catch (e: unknown) {
            throw new BadRequestError("Can't parse request body...")
        }
    }

    public static processHeaders(rawHeadersLines: string[]) {
        return rawHeadersLines.map(headerLine => {
            const index = headerLine.indexOf(":")

            const header = headerLine
                .slice(0, index)
                .split("-")
                .map(word => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`)
                .join("-")

            const value = headerLine.slice(index + 1).trim()

            return [header, value]
        })
    }

    public static parseParams(requestUrl: string, url: string) {
        const params: Record<string, string> = {}
        const requestUrlSplit = requestUrl.split("/").filter((val) => val.trim() != "")
        const urlSplit = url.split("/").filter((val) => val.trim() != "")
        
        for (let i = 0; i < requestUrlSplit.length; i++) {
            if (requestUrlSplit[i] != urlSplit[i] && urlSplit[i].includes(":")) {
                const paramName = urlSplit[i].split(":")[1]
        
                params[paramName] = requestUrlSplit[i]
            }
        }
        
        return params
    }

    private static parseUrl(line: string) {
        const data = line.split(' ')

        return {method: data[0], url: data[1]}
    }
}