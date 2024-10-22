import { Request } from "../request/request";
import { HttpMethod } from "./request.types";

export type RouteAction = (request: Request) => Promise<string>
export type Middleware = (request: Request) => Promise<boolean>

export class Route {
    constructor(
        public readonly method: HttpMethod,
        public readonly url: string,
        public readonly action: RouteAction,
        public readonly middleware: Middleware[] = []
    ) {}
}