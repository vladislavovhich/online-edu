import { IsString } from "class-validator";

export class MediaDto {
    @IsString()
    image: string;
}
