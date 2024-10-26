import { PrismaClient } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { UserService } from "../user/user.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { NotFoundError } from "../../lib/errors/not-found.error"
import { CourseSubDto } from "./dto/course-sub.dto"
import { BadRequestError } from "../../lib/errors/bad-request.error"

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

    public async getCourses(userId: number) {
        const user = await this.userService.findOne(userId)

        if (!user) {
            throw new NotFoundError("User not found...")
        }

        const studentsCourses = await this.prisma.studentCourse.findMany({
            where: {
                studentId: userId
            },
            include: {
                course: {
                    include: {
                        mentor: true
                    }
                }
            }
        })
        const courses = studentsCourses.map(studentCourse => studentCourse.course)

        return courses
    }

    public async subscribe(courseSubDto: CourseSubDto) {
        const isSubbed = await this.isSubbed(courseSubDto)

        if (isSubbed) {
            throw new BadRequestError("You're already subbed to this course...")
        }

        const course = await this.findOne(courseSubDto.courseId)

        if (!course) {
            throw new NotFoundError(`Course with id ${courseSubDto.courseId} not found...`)
        }

        await this.prisma.studentCourse.create({
            data: {
                course: {connect: {id: courseSubDto.courseId}},
                student: {connect: {id: courseSubDto.userId}}
            }
        })
    }

    public async unsubscribe(courseSubDto: CourseSubDto) {
        const isSubbed = await this.isSubbed(courseSubDto)

        if (!isSubbed) {
            throw new BadRequestError("You're not subbed to this course...")
        }

        const course = await this.findOne(courseSubDto.courseId)

        if (!course) {
            throw new NotFoundError(`Course with id ${courseSubDto.courseId} not found...`)
        }

        await this.prisma.studentCourse.deleteMany({
            where: {
                courseId: courseSubDto.courseId,
                studentId: courseSubDto.userId
            }
        })
    }

    public isSubbed(courseSubDto: CourseSubDto) {
        return this.prisma.studentCourse.findFirst({where: {
            studentId: courseSubDto.userId, 
            courseId: courseSubDto.courseId
        }})
    }

    public async findOne(id: number) {
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