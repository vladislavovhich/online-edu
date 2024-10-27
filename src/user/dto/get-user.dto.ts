import { User } from "@prisma/client"

export class GetUserDto {
    private id: number
    private name: string
    private surname: string
    private email: string
    private role: string
    private createdAt: Date

    constructor(user: User) {
        Object.assign(this, {
            id: user.id,
            name: user.name,
            username: user.surname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        })
    }
}