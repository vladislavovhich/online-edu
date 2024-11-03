import { Course, Lecture, StudentCourse, User } from "@prisma/client";
import { GetUserDto } from "../../user/dto/get-user.dto";

export class GetCourseDto {
    private id: number;
    private name: string;
    private description: string;
    private studentsAmount: number;
    private lecturesAmount: number;
    private mentor: GetUserDto;
    private createdAt: Date;

    constructor(
        course: Course & {
            mentor: User & {
                userCourses: { courseId: number; studentId: number }[];
            };
            students: StudentCourse[];
            lectures: Lecture[];
        }
    ) {
        Object.assign(this, {
            id: course.id,
            name: course.name,
            description: course.description,
            mentor: new GetUserDto(course.mentor),
            studentsAmount: course.students.length,
            lecturesAmount: course.lectures.length,
            createdAt: course.createdAt,
        });
    }
}
