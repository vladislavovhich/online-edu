import { PrismaClient } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { UserService } from "../user/user.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { NotFoundError } from "../../lib/errors/not-found.error"

export class CourseService {
    private static instance: CourseService

    private constructor(
        private prisma: PrismaClient,
        private userService: UserService
    ) {}

    public static async GetInstance() {
        if (!CourseService.instance) {
            const prisma = await PrismaService.GetInstance()
            const userService = await UserService.GetInstance()

            CourseService.instance = new CourseService(prisma, userService)
        }

        return CourseService.instance
    }

    public findOne(id: number) {
        return this.prisma.course.findFirst({ where: {id}})
    }

    public findAll() {
        return this.prisma.course.findMany({
            include: {
                mentor: true
            }
        })
    }

    public create(createCourseDto: CreateCourseDto) {
        return this.prisma.course.create({
            data: {
                name: createCourseDto.name,
                description: createCourseDto.description,
                mentor: { connect: {id: createCourseDto.mentorId }}
            }
        })
    }

    public async update(id: number, updateCourseDto: UpdateCourseDto) {
        const course = await this.findOne(id)

        if (!course) {
            throw new NotFoundError(`Course with id ${id} not found...`)
        }

        return this.prisma.course.update({
            where: {id},
            data: updateCourseDto
        })
    }

    public async delete(id: number) {
        const course = await this.findOne(id)

        if (!course) {
            throw new NotFoundError(`Course with id ${id} not found...`)
        }

        await this.prisma.course.delete({where: {id}})
    }
}