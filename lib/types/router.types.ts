import { Request } from "../request";
import { HttpMethod } from "./request.types";

export type RouteAction = (request: Request) => void 

export class Route {
    constructor(
        public readonly method: HttpMethod,
        public readonly url: string,
        public readonly action: RouteAction
    ) {}
}