import { HttpMethod } from "./types/request.types";
import { Route, RouteAction } from "./types/router.types";
import { Request } from "./request";

export class Router {
    constructor(
        public readonly routes: Route[] = []
    ) {}

    public static combine(routers: Router[]) {
        const routes: Route[] = []

        for (let router of routers) {
            routes.push(...router.routes)
        }

        return new Router(routes)
    }

    add(method: HttpMethod, url: string, action: RouteAction) {
        if (this.routes.some(route => route.url == url && route.method == method)) {
            throw new Error("You've already defined such route")
        }

        this.routes.push(new Route(method, url, action))
    }

    handle(request: Request) {
        let hasFound = false

        for (let route of this.routes) {
            if (request.url.includes(route.url) && route.method == request.method) {
                hasFound = true

                route.action(request)
            } 
        }

        if (!hasFound) {
            throw new Error("Incorrect method or url...")
        }
    }
}