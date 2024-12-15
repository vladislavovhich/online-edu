import { Router } from "../../lib/request/router";
import { MediaController } from "./media.controller";

export const createMediaRouter = async () => {
    const controller = await MediaController.resolve();
    const router = new Router();

    router.post("/media", controller.receive.bind(controller));
    router.get("/media", controller.send.bind(controller));

    return router;
};
