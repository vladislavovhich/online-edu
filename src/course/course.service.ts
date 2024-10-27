import { PrismaClient } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { UserService } from "../user/user.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { NotFoundError } from "../../lib/errors/not-found.error"
import { CourseSubDto } from "./dto/course-sub.dto"
import { BadRequestError } from "../../lib/errors/bad-request.error"
import { PaginationDto } from "../common/dto/pagination.dto"
import { GetCourseDto } from "./dto/get-course.dto"
import { GetCoursesDto } from "./dto/get-courses.dto"
import { off } from "process"

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

    public async getCourses(userId: number, paginationDto: PaginationDto) {
        await this.userService.findOneSave(userId)

        const {pageSize, offset} = paginationDto
        const studentsCourses = await this.prisma.studentCourse.findMany({
            take: pageSize,
            skip: offset,
            where: {
                studentId: userId
            },
            include: {
                course: {
                    include: {
                        mentor: true,
                        lectures: true,
                        students: true
                    }
                }
            }
        })

        const count = await this.prisma.studentCourse.count({where: { studentId: userId}})
        const courseDtos = studentsCourses.map(studentsCourses => new GetCourseDto(studentsCourses.course))

        return new GetCoursesDto(courseDtos, count, paginationDto)
    }

    public async subscribe(courseSubDto: CourseSubDto) {
        const isSubbed = await this.isSubbed(courseSubDto)

        if (isSubbed) {
            throw new BadRequestError("You're already subbed to this course...")
        }

        await this.findOneSave(courseSubDto.courseId)

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

        await this.findOneSave(courseSubDto.courseId)

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
        return this.prisma.course.findFirst({ 
            where: {id}, 
            include: {
                mentor: true,
                lectures: true,
                students: true
            }
        })
    }

    public async findOneSave(id: number) {
        const course = await this.findOne(id)

        if (!course) {
            throw new NotFoundError("Course not found...")
        }

        return course
    }

    public async findAll(paginationDto: PaginationDto) {
        const {pageSize, offset} = paginationDto
        const courses = await this.prisma.course.findMany({
            take: pageSize,
            skip: offset,
            include: {
                mentor: true,
                lectures: true,
                students: true
            }
        })

        const count = await this.prisma.course.count()
        const courseDtos = courses.map(course => new GetCourseDto(course))

        return new GetCoursesDto(courseDtos, count, paginationDto)
    }

    public async create(createCourseDto: CreateCourseDto) {
        const course = await this.prisma.course.create({
            data: {
                name: createCourseDto.name,
                description: createCourseDto.description,
                mentor: { connect: {id: createCourseDto.mentorId }}
            }
        })

        return this.findOneSave(course.id)
    }

    public async update(id: number, updateCourseDto: UpdateCourseDto) {
        await this.findOneSave(id)

        await this.prisma.course.update({
            where: {id},
            data: updateCourseDto
        })

        return this.findOneSave(id)
    }

    public async delete(id: number) {
        await this.findOneSave(id)

        await this.prisma.course.delete({where: {id}})
    }
}