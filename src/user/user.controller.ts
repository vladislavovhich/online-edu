import { BadRequestError } from "../../lib/errors/bad-request.error";
import { Request } from "../../lib/request/request";
import { HttpStatus } from "../../lib/types/response.types";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";
import { Response } from "../../lib/response/response";
import { NotFoundError } from "../../lib/errors/not-found.error";
import { plainToInstance } from "class-transformer";
import { GetUserDto } from "./dto/get-user.dto";
import { extractUser } from "../common/helpers/extract-user.helper";

export class UserController {
    private static instance: UserController;

    private constructor(private readonly userService: UserService) {}

    public static async GetInstance() {
        if (!UserController.instance) {
            const userService = await UserService.GetInstance();

            UserController.instance = new UserController(userService);
        }

        return UserController.instance;
    }

    public async findOne(request: Request) {
        const userId = parseInt(request.params.id);
        const user = await this.userService.findOneSave(userId);

        if (!user) {
            throw new NotFoundError("User not found...");
        }

        const userDto = new GetUserDto(user);

        return new Response().json(HttpStatus.OK, { user: userDto });
    }

    public async update(request: Request) {
        const updateUserDto = plainToInstance(UpdateUserDto, request.body);
        const currentUser = await extractUser(request);

        updateUserDto.userId = currentUser.id;

        const user = await this.userService.update(updateUserDto);

        const userDto = new GetUserDto(user);

        return new Response().json(HttpStatus.OK, { user: userDto });
    }
}
