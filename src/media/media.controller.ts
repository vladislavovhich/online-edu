import { plainToInstance } from "class-transformer";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";
import { MediaMessageDto, MediaUserDto, MediaVideoDto } from "./dto/media.dto";
import { LectureMedia } from "./media.types";

export class MediaController {
    private static instance: MediaController;
    private media: LectureMedia[] = [];

    private constructor() {}

    public static async resolve() {
        if (!MediaController.instance) {
            MediaController.instance = new MediaController();
        }

        return MediaController.instance;
    }

    public async users(request: Request) {
        const mediaDto = plainToInstance(MediaUserDto, request.body);
        const lectureId = parseInt(request.params.lectureId);

        if (!this.media.some((media) => media.lectureId === lectureId)) {
            this.media.push({
                lectureId,
                students: [],
                messages: [],
                video: "",
            });
        }

        if (
            !this.media.some(
                (media) =>
                    media.lectureId === lectureId &&
                    media.students.some(
                        (student) => student.id === mediaDto.user.id
                    )
            )
        ) {
            this.media = this.media.map((m) =>
                m.lectureId === lectureId
                    ? {
                          ...m,
                          students: [...m.students, mediaDto.user],
                      }
                    : m
            );
        }

        return new Response().text(HttpStatus.OK, "User is received...");
    }

    public async videos(request: Request) {
        const mediaDto = plainToInstance(MediaVideoDto, request.body);
        const lectureId = parseInt(request.params.lectureId);

        if (!this.media.some((media) => media.lectureId === lectureId)) {
            this.media.push({
                lectureId,
                students: [],
                messages: [],
                video: "",
            });
        }

        this.media = this.media.map((m) =>
            m.lectureId === lectureId
                ? {
                      ...m,
                      video: mediaDto.video,
                  }
                : m
        );

        return new Response().text(HttpStatus.OK, "Video is received...");
    }

    public async messages(request: Request) {
        const mediaDto = plainToInstance(MediaMessageDto, request.body);
        const lectureId = parseInt(request.params.lectureId);

        if (!this.media.some((media) => media.lectureId === lectureId)) {
            this.media.push({
                lectureId,
                students: [],
                messages: [],
                video: "",
            });
        }

        this.media = this.media.map((m) =>
            m.lectureId === lectureId
                ? {
                      ...m,
                      messages: [...m.messages, mediaDto],
                  }
                : m
        );

        return new Response().text(HttpStatus.OK, "Message is received...");
    }

    public async send(request: Request) {
        const lectureId = parseInt(request.params.lectureId);
        const lecture = this.media.find((m) => m.lectureId === lectureId);

        if (!lecture) {
            throw new BadRequestError("No lecture were found...");
        }

        return new Response().json(HttpStatus.OK, lecture);
    }
}
