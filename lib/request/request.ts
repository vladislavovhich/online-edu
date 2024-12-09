import { JwtPayload } from "../../src/jwt/jwt.types";
import { BadRequestError } from "../errors/bad-request.error";

export class Request {
    public params: Record<string, string> = {};
    public payload?: JwtPayload;

    private constructor(
        public readonly url: string,
        public readonly method: string,
        public readonly headers: string[][],
        public readonly body: Record<string, string> = {},
        public readonly cookie: Record<string, string> = {},
        public readonly query: Record<string, string> = {}
    ) {}

    public static parse(rawRequest: string) {
        const { url, method } = Request.parseUrl(rawRequest);
        const headers = Request.parseHeaders(rawRequest);
        const cookies = Request.parseCookies(headers);
        const body = Request.parseBody(rawRequest.split("\r\n"), headers);
        const queryParams = Request.parseQueryParams(url);

        const request = new Request(
            url,
            method,
            headers,
            body,
            cookies,
            queryParams
        );

        return request;
    }

    public static parseHeaders(rawRequest: string) {
        const lines = rawRequest.split("\r\n");
        const headerEndIndex = lines.indexOf("");
        const headerLines = lines.slice(1, headerEndIndex);
        const headers = Request.processHeaders(headerLines);

        return headers;
    }

    public static parseQueryParams(url: string) {
        const queryParamsIndex = url.indexOf("?");

        if (queryParamsIndex == -1) {
            return {};
        }

        const queryParamsLine = url.slice(queryParamsIndex + 1);
        const queryParamsRaw = queryParamsLine.split("&");

        const queryParams: Record<string, string> = {};

        for (let queryParamRaw of queryParamsRaw) {
            const [name, value] = queryParamRaw.split("=");

            queryParams[name] = value;
        }

        return queryParams;
    }

    public static parseBody(requestLines: string[], headers: string[][]) {
        try {
            const contentTypeIndex = headers.findIndex(
                ([header, value]) => header == "Content-Type"
            );

            if (contentTypeIndex == -1) {
                return {};
            }

            const contentType = headers[contentTypeIndex][1];
            const headerEndIndex = requestLines.indexOf("");

            if (contentType == "application/json") {
                const body = JSON.parse(
                    requestLines.slice(headerEndIndex + 1).join("")
                );

                return body;
            }

            return {};
        } catch (e: unknown) {
            throw new BadRequestError("Can't parse request body...");
        }
    }

    public static parseCookies(headers: string[][]) {
        try {
            const cookies: Record<string, string> = {};

            for (let [header, value] of headers) {
                if (header == "Cookie") {
                    const rawCookies = value.split(";");

                    for (let rawCookie of rawCookies) {
                        const equalIndex = rawCookie.indexOf("=");
                        const cookieName = rawCookie
                            .slice(0, equalIndex)
                            .trim();
                        const cookieVal = rawCookie
                            .slice(equalIndex + 1)
                            .trim();

                        cookies[cookieName] = cookieVal;
                    }
                }
            }

            return cookies;
        } catch (e: unknown) {
            throw new BadRequestError("Can't parse request body...");
        }
    }

    public static processHeaders(rawHeadersLines: string[]) {
        return rawHeadersLines.map((headerLine) => {
            const index = headerLine.indexOf(":");

            const header = headerLine
                .slice(0, index)
                .split("-")
                .map(
                    (word) =>
                        `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`
                )
                .join("-");

            const value = headerLine.slice(index + 1).trim();

            return [header, value];
        });
    }

    public static parseParams(requestUrl: string, url: string) {
        const params: Record<string, string> = {};
        const requestUrlSplit = requestUrl
            .split("/")
            .filter((val) => val.trim() != "");
        const urlSplit = url.split("/").filter((val) => val.trim() != "");

        for (let i = 0; i < requestUrlSplit.length; i++) {
            if (
                requestUrlSplit[i] != urlSplit[i] &&
                urlSplit[i].includes(":")
            ) {
                const paramName = urlSplit[i].split(":")[1];

                params[paramName] = requestUrlSplit[i];
            }
        }

        return params;
    }

    private static parseUrl(rawRequest: string) {
        const lines = rawRequest.split("\r\n");
        const data = lines[0].split(" ");

        return { method: data[0], url: data[1] };
    }
}
