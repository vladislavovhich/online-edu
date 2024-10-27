import { plainToInstance } from "class-transformer"
import { Request } from "../../lib/request/request"
import { LectureService } from "./lecture.service"
import { CreateLectureDto } from "./dto/create-lecture.dto"
import { extractUser } from "../common/helpers/extract-user.helper"
import { HttpStatus } from "../../lib/types/response.types"
import { Response } from "../../lib/response/response"
import { UpdateLectureDto } from "./dto/update-lecture.dto"
import { GetLectureDto } from "./dto/get-lecture.dto"

export class LectureController {
    private static instance: LectureController

    private constructor(
        private readonly lectureService: LectureService,
    ) {}

    public static async GetInstance() {
        if (!LectureController.instance) {
            const lectureService = await LectureService.GetInstance()

            LectureController.instance = new LectureController(lectureService)
        }

        return LectureController.instance
    }

    public async getCourseLectures(request: Request) {
        const courseId = parseInt(request.params.courseId)
        const lectures = await this.lectureService.getCourseLectures(courseId)

        return new Response()
            .json(HttpStatus.OK, {lectures})
    }

    public async create(request: Request) {
        const createLectureDto = plainToInstance(CreateLectureDto, request.body)
        const user = await extractUser(request)
        const courseId = parseInt(request.params.courseId)

        createLectureDto.mentorId = user.id
        createLectureDto.courseId = courseId

        const lecture = await this.lectureService.create(createLectureDto)
        const lectureDto = new GetLectureDto(lecture)

        return new Response()
            .json(HttpStatus.OK, {lecture: lectureDto})
    }

    public async update(request: Request) {
        const updateLectureDto = plainToInstance(UpdateLectureDto, request.body)
        const lectureId = parseInt(request.params.id)
        const lecture = await this.lectureService.update(lectureId, updateLectureDto)
        const lectureDto = new GetLectureDto(lecture)

        return new Response()
            .json(HttpStatus.OK, {lecture: lectureDto})
    }

    public async delete(request: Request) {
        const lectureId = parseInt(request.params.id)

        await this.lectureService.delete(lectureId)

        return new Response()
            .text(HttpStatus.OK, "Lecture is successfully deleted...")
    }
}