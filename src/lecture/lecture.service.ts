import { PrismaClient } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { CreateLectureDto } from "./dto/create-lecture.dto"
import { UpdateLectureDto } from "./dto/update-lecture.dto"
import { NotFoundError } from "../../lib/errors/not-found.error"
import { CourseService } from "../course/course.service"
import { GetLectureDto } from "./dto/get-lecture.dto"

export class LectureService {
    private static instance: LectureService

    private constructor(
        private readonly prisma: PrismaClient,
        private readonly courseService: CourseService
    ) {}

    public static async GetInstance() {
        if (!LectureService.instance) {
            const prisma = await PrismaService.GetInstance()
            const courseService = await CourseService.GetInstance()

            LectureService.instance = new LectureService(prisma, courseService)
        }

        return LectureService.instance
    }

    public async getCourseLectures(courseId: number) {
        await this.courseService.findOneSave(courseId)

        const lectures = await this.prisma.lecture.findMany({ where: {courseId} })
        const lecturesDto = lectures.map(lecture => new GetLectureDto(lecture))

        return lecturesDto
    }

    public findOne(id: number) {
        return this.prisma.lecture.findFirst({where: {id}})
    }

    public async findOneSave(id: number) {
        const lecture = await this.findOne(id)

        if (!lecture) {
            throw new NotFoundError("Lecture not found...")
        }

        return lecture
    }

    public async create(createLectureDto: CreateLectureDto) {
        const {name, description, subject, date, mentorId, courseId} = createLectureDto

        await this.courseService.findOneSave(courseId)

        return this.prisma.lecture.create({
            data: {
                name, description, subject, date,
                mentor: {connect: {id: mentorId}},
                course: {connect: {id: courseId}}
            }
        })
    }

    public async update(id: number, updateLectureDto: UpdateLectureDto) {
        await this.findOneSave(id)

        return this.prisma.lecture.update({
            where: {id},
            data: updateLectureDto
        })
    }

    public async delete(id: number) {
        await this.findOneSave(id)

        await this.prisma.lecture.delete({where: {id}})
    }
}