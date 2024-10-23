import { BadRequestError } from "../../lib/errors/bad-request.error"
import { NotFoundError } from "../../lib/errors/not-found.error"
import { Request } from "../../lib/request/request"
import { Response } from "../../lib/response/response"
import { HttpStatus } from "../../lib/types/response.types"
import { UserService } from "../user/user.service"
import { CourseService } from "./course.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"

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

    public async create(request: Request) {
        const createCourseDto = Object.assign(new CreateCourseDto(), request.body)

        if (!request.payload) {
            throw new BadRequestError("User isn't authorized, so you can't access this resource...")
        }

        const user = await this.userService.findByEmail(request.payload.email)

        if (!user) {
            throw new BadRequestError("User isn't specified...")
        }

        createCourseDto.mentorId = user.id

        const course = await this.courseService.create(createCourseDto)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify(course))
    }

    public async update(request: Request) {
        const updateCourseDto = Object.assign(new UpdateCourseDto(), request.body)

        const courseId = parseInt(request.params.id)
        const course = await this.courseService.update(courseId, updateCourseDto)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify(course))
    }

    public async delete(request: Request) {
        const courseId = parseInt(request.params.id)

        await this.courseService.delete(courseId)
        
        return new Response()
            .text(HttpStatus.OK, "Course is successfully deleted...")
    }

    public async findOne(request: Request) {
        const courseId = parseInt(request.params.id)
        const course = await this.courseService.findOne(courseId)

        if (!course) {
            throw new NotFoundError("Course not found...")
        }

        return new Response()
            .json(HttpStatus.OK, JSON.stringify(course))
    }

    public async findAll(request: Request) {
        const courses = await this.courseService.findAll()

        return new Response()
            .json(HttpStatus.OK, JSON.stringify(courses)) 
    }
}