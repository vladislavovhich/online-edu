import { Type } from "class-transformer";
import {
    IsDateString,
    IsISO8601,
    IsString,
    MaxLength,
    MinDate,
    MinLength,
} from "class-validator";

export class CreateLectureDto {
    @IsString()
    @MinLength(1)
    @MaxLength(35)
    name: string;

    @IsString()
    @MinLength(1)
    @MaxLength(255)
    description: string;

    @IsString()
    @MinLength(1)
    @MaxLength(35)
    subject: string;

    @Type(() => Date)
    @MinDate(() => new Date(Date.now()))
    date: Date;

    mentorId: number;
    courseId: number;
}
