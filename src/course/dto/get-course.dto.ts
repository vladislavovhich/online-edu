import { Course, Lecture, StudentCourse, User } from "@prisma/client"
import { GetUserDto } from "../../user/dto/get-user.dto"

export class GetCourseDto {
    private id: number
    private name: string
    private description: string
    private studentsAmount: number
    private lecturesAmount: number
    private mentor: GetUserDto

    constructor(
        course: Course & {
        mentor: User;
        students: StudentCourse[]
        lectures: Lecture[]
    }) {
        Object.assign(this, {
            id: course.id,
            name: course.name,
            description: course.description,
            mentor: new GetUserDto(course.mentor),
            studentsAmount: course.students.length,
            lecturesAmount: course.lectures.length
        })
    }
}