import { GetUserDto, GetUserInfoDto } from "../user/dto/get-user.dto";

export type Message = {
    text: string;
    user: GetUserInfoDto;
};

export type LectureMedia = {
    lectureId: number;
    students: GetUserInfoDto[];
    messages: Message[];
    video: string;
};
