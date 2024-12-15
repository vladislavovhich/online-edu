import { Router } from "../../lib/request/router";
import { MediaController } from "./media.controller";

export const createMediaRouter = async () => {
    const controller = await MediaController.resolve();
    const router = new Router();

    router.post(
        "/media/:lectureId/messages",
        controller.messages.bind(controller)
    );
    router.post("/media/:lectureId/users", controller.users.bind(controller));
    router.post("/media/:lectureId/videos", controller.videos.bind(controller));

    router.get("/media/:lectureId", controller.send.bind(controller));

    return router;
};
