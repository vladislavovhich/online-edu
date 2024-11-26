import { BadRequestError } from "../errors/bad-request.error";
import { NotFoundError } from "../errors/not-found.error";
import { HttpMethod } from "../types/request.types";
import { Middleware, Route, RouteAction } from "../types/router.types";
import { Request } from "./request";
import { Response } from "../response/response";
import fs from "node:fs";
import { ContentType, HttpStatus } from "../types/response.types";

export class Router {
    public static video: Record<string, string>;

    constructor(public readonly routes: Route[] = []) {}

    public static combine(routers: Router[]) {
        const routes: Route[] = [];

        for (let router of routers) {
            routes.push(...router.routes);
        }

        return new Router(routes);
    }

    add(
        method: HttpMethod,
        url: string,
        action: RouteAction,
        middleware: Middleware[] = []
    ) {
        if (
            this.routes.some(
                (route) => route.url == url && route.method == method
            )
        ) {
            throw new Error("You've already defined such route");
        }

        this.routes.push(new Route(method, url, action, middleware));
    }

    get(url: string, action: RouteAction, middleware: Middleware[] = []) {
        this.add(HttpMethod.GET, url, action, middleware);
    }

    post(url: string, action: RouteAction, middleware: Middleware[] = []) {
        this.add(HttpMethod.POST, url, action, middleware);
    }

    put(url: string, action: RouteAction, middleware: Middleware[] = []) {
        this.add(HttpMethod.PUT, url, action, middleware);
    }

    patch(url: string, action: RouteAction, middleware: Middleware[] = []) {
        this.add(HttpMethod.PATCH, url, action, middleware);
    }

    delete(url: string, action: RouteAction, middleware: Middleware[] = []) {
        this.add(HttpMethod.DELETE, url, action, middleware);
    }

    async handle(request: Request, raw: string) {
        if (request.method == "OPTIONS") {
            return new Response().cors();
        }

        if (request.headers[1][1] == "Upgrade") {
            return "";
        }

        if (request.url == "/video") {
            Router.video = request.body;

            return new Response().json(HttpStatus.OK, request.body);
        } else if (request.url == "/content") {
            return new Response().json(HttpStatus.OK, Router.video);
        }

        const route = this.routes.find(
            (route) =>
                this.checkUrl(request.url, route.url) &&
                route.method == request.method
        );

        if (!route) {
            throw new NotFoundError(
                "Can't handle this route cause it's not defined..."
            );
        }

        request.params = Request.parseParams(request.url, route.url);

        for (let middleware of route.middleware) {
            const result = await middleware(request);

            if (!result) {
                throw new BadRequestError(
                    "Middlware can't pass you further..."
                );
            }
        }

        console.log(
            `${request.method} ${request.url} -> ${route.method} ${route.url}`
        );

        const response = await route.action(request);

        return response;
    }

    checkUrl(requestUrl: string, url: string) {
        const requestUrlSplit = requestUrl
            .split("/")
            .filter((val) => val.trim() != "");

        const urlSplit = url.split("/").filter((val) => val.trim() != "");

        if (!url.includes(":")) {
            if (urlSplit.length != requestUrlSplit.length) {
                return false;
            }

            for (let i = 0; i < urlSplit.length; i++) {
                if (!requestUrlSplit[i].startsWith(urlSplit[i])) {
                    return false;
                }
            }

            return true;
        }

        if (urlSplit.length != requestUrlSplit.length) {
            return false;
        }

        for (let i = 0; i < urlSplit.length; i++) {
            if (
                (urlSplit[i].includes(":") &&
                    Number.isNaN(requestUrlSplit[i])) ||
                (!urlSplit[i].includes(":") &&
                    !requestUrlSplit[i].startsWith(urlSplit[i]))
            ) {
                return false;
            }
        }

        return true;
    }
}
