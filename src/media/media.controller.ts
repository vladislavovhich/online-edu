import { plainToInstance } from "class-transformer";
import { BadRequestError } from "../../lib/errors/bad-request.error";
import { Request } from "../../lib/request/request";
import { Response } from "../../lib/response/response";
import { HttpStatus } from "../../lib/types/response.types";
import { MediaDto } from "./dto/media.dto";

export class MediaController {
    private static instance: MediaController;
    private video: string = "";

    private constructor() {}

    public static async resolve() {
        if (!MediaController.instance) {
            MediaController.instance = new MediaController();
        }

        return MediaController.instance;
    }

    public async receive(request: Request) {
        const mediaDto = plainToInstance(MediaDto, request.body);

        this.video = mediaDto.image;

        return new Response().text(HttpStatus.OK, "Video is received...");
    }

    public async send(request: Request) {
        const video = this.video;

        return new Response().json(HttpStatus.OK, { image: video });
    }
}
