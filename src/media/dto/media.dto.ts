import { IsString } from "class-validator";
import { GetUserInfoDto } from "../../user/dto/get-user.dto";

export class MediaVideoDto {
    @IsString()
    video: string;
}

export class MediaMessageDto {
    @IsString()
    text: string;

    user: GetUserInfoDto;
}

export class MediaUserDto {
    user: GetUserInfoDto;
}
