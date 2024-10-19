export class Request {
    private constructor(
        public readonly url: string, 
        public readonly method: string,
        public readonly headers: string[][]
    ) {}

    public static parse(request: string) {
        const lines = request.split("\r\n")
        const {url, method} = Request.parseUrl(lines[0])
        const headerLines = lines.slice(1, lines.length - 2)

        const headers = headerLines.map(headerLine => headerLine.split(":"))

        return new Request(url, method, headers)
    }

    private static parseUrl(line: string) {
        const data = line.split(' ')

        return {method: data[0], url: data[1]}
    }
}