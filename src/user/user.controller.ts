import { BadRequestError } from "../../lib/errors/bad-request.error"
import { Request } from "../../lib/request/request"
import { HttpStatus } from "../../lib/types/response.types"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UserService } from "./user.service"
import { Response } from "../../lib/response/response"
import { NotFoundError } from "../../lib/errors/not-found.error"

export class UserController {
    private static instance: UserController
    
    private constructor(
        private readonly userService: UserService
    ) {}

    public static async GetInstance() {
        if (!UserController.instance) {
            const userService = await UserService.GetInstance()

            UserController.instance = new UserController(userService)
        }

        return UserController.instance
    }

    public async findOne(request: Request) {
        const userId = parseInt(request.params.id)
        const user = await this.userService.findOne(userId)

        if (!user) {
            throw new NotFoundError("User not found...")
        }

        return new Response()
            .json(HttpStatus.OK, JSON.stringify({user}))
    }

    public async update(request: Request) {
        const updateUserDto = Object.assign(new UpdateUserDto(), request.body)
        const payload = request.payload

        if (!payload) {
            throw new BadRequestError("No user specified...")
        }

        const user = await this.userService.update(updateUserDto)

        return new Response()
            .json(HttpStatus.OK, JSON.stringify({user}))
    }
}