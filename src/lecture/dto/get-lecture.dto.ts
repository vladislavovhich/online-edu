import { Lecture } from "@prisma/client";

export class GetLectureDto {
    private id: number;
    private name: string;
    private description: string;
    private subject: string;
    private date: Date;
    private isOver: boolean;
    private fileUrl: string;
    private createdAt: Date;

    constructor(lecture: Lecture) {
        Object.assign(this, {
            id: lecture.id,
            name: lecture.name,
            description: lecture.description,
            subject: lecture.subject,
            isOver: lecture.isOver,
            fileUrl: lecture.fileUrl,
            createdAt: lecture.createdAt,
            date: lecture.date,
        });
    }
}
