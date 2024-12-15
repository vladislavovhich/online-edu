import { BadRequestError } from "../errors/bad-request.error";
import { Request } from "../request/request";
import { HttpMethod } from "./request.types";

export type RouteAction = (request: Request) => Promise<Buffer>;
export type Middleware = (request: Request) => Promise<boolean>;

export class Route {
    constructor(
        public readonly method: HttpMethod,
        public readonly url: string,
        public readonly action: RouteAction,
        public readonly middlewares: Middleware[] = []
    ) {}

    public async run(request: Request) {
        for (let middleware of this.middlewares) {
            const result = await middleware(request);

            if (!result) {
                throw new BadRequestError(
                    "Middlware can't pass you further..."
                );
            }
        }

        const result = await this.action(request);

        return result;
    }
}
