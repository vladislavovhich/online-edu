import { plainToInstance } from "class-transformer"
import { BadRequestError } from "../../lib/errors/bad-request.error"
import { NotFoundError } from "../../lib/errors/not-found.error"
import { Request } from "../../lib/request/request"
import { Response } from "../../lib/response/response"
import { HttpStatus } from "../../lib/types/response.types"
import { extractUser } from "../common/helpers/extract-user.helper"
import { UserService } from "../user/user.service"
import { CourseService } from "./course.service"
import { CourseSubDto } from "./dto/course-sub.dto"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { PaginationDto } from "../common/dto/pagination.dto"
import { GetCourseDto } from "./dto/get-course.dto"

export class CourseController {
    private static instance: CourseController

    private constructor(
        private readonly courseService: CourseService,
        private readonly userService: UserService
    ) {}

    public static async GetInstance() {
        if (!CourseController.instance) {
            const courseService = await CourseService.GetInstance()
            const userService = await UserService.GetInstance()

            CourseController.instance = new CourseController(courseService, userService)
        }

        return CourseController.instance
    }

    public async getCourses(request: Request) {
        const paginationDto = plainToInstance(PaginationDto, request.query)
        const userId = parseInt(request.params.userId)
        const courses = await this.courseService.getCourses(userId, paginationDto)

        return new Response()
            .json(HttpStatus.OK, courses)
    }

    public async subscribe(request: Request) {
        const user = await extractUser(request)
        const courseSubDto = new CourseSubDto()

        courseSubDto.userId = user.id
        courseSubDto.courseId = parseInt(request.params.id)

        await this.courseService.subscribe(courseSubDto)

        return new Response()
            .text(HttpStatus.OK, "You've successfully subscribed to the course...")
    }

    public async unsubscribe(request: Request) {
        const user = await extractUser(request)
        const courseSubDto = new CourseSubDto()

        courseSubDto.userId = user.id
        courseSubDto.courseId = parseInt(request.params.id)

        await this.courseService.unsubscribe(courseSubDto)

        return new Response()
            .text(HttpStatus.OK, "You've successfully unsubscribed to the course...")
    }

    public async create(request: Request) {
        const createCourseDto = plainToInstance(CreateCourseDto, request.body)
        const user = await extractUser(request)
        
        createCourseDto.mentorId = user.id

        const course = await this.courseService.create(createCourseDto)
        const courseDto = new GetCourseDto(course)

        return new Response()
            .json(HttpStatus.OK, {course: courseDto})
    }

    public async update(request: Request) {
        const updateCourseDto = plainToInstance(UpdateCourseDto, request.body)

        const courseId = parseInt(request.params.id)
        const course = await this.courseService.update(courseId, updateCourseDto)
        const courseDto = new GetCourseDto(course)

        return new Response()
            .json(HttpStatus.OK, {course: courseDto})
    }

    public async delete(request: Request) {
        const courseId = parseInt(request.params.id)

        await this.courseService.delete(courseId)
        
        return new Response()
            .text(HttpStatus.OK, "Course is successfully deleted...")
    }

    public async findOne(request: Request) {
        const courseId = parseInt(request.params.id)
        const course = await this.courseService.findOneSave(courseId)
        const courseDto = new GetCourseDto(course)
        
        return new Response()
            .json(HttpStatus.OK, {course: courseDto})
    }

    public async findAll(request: Request) {
        const paginationDto = plainToInstance(PaginationDto, request.query)
        const courses = await this.courseService.findAll(paginationDto)

        return new Response()
            .json(HttpStatus.OK, courses) 
    }
}