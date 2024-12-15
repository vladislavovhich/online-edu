import { Router } from "../lib/request/router";
import { SocketServer } from "../lib/server";
import { createAuthRouter } from "../src/auth/auth.router";
import { createCourseRouter } from "./course/course.router";
import { createGroupRouter } from "./group/group.router";
import { createLectureRouter } from "./lecture/lecture.router";
import { createMessageRouter } from "./message/message.router";
import { createUserRouter } from "./user/user.router";
import "reflect-metadata";
import fs from "node:fs";
import { createMediaRouter } from "./media/media.router";

const start = async (port: number) => {
    const authRouter = await createAuthRouter();
    const courseRouter = await createCourseRouter();
    const userRouter = await createUserRouter();
    const groupRouter = await createGroupRouter();
    const messageRouter = await createMessageRouter();
    const lectureRouter = await createLectureRouter();
    const mediaRouter = await createMediaRouter();

    const router = Router.combine([
        lectureRouter,
        authRouter,
        courseRouter,
        userRouter,
        messageRouter,
        groupRouter,
        mediaRouter,
    ]);

    const server = new SocketServer(router);

    server.start(port);
};

start(8080);
