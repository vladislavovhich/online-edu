import { User } from "@prisma/client";

export class GetUserDto {
    private id: number;
    private name: string;
    private surname: string;
    private email: string;
    private role: string;
    private createdAt: Date;
    private courses: number[];

    constructor(
        user: User & { userCourses: { courseId: number; studentId: number }[] }
    ) {
        Object.assign(this, {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            courses: user.userCourses.map((userCourse) => userCourse.courseId),
        });
    }
}

export class GetUserInfoDto {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    createdAt: Date;

    constructor(user: User) {
        Object.assign(this, {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    }
}
