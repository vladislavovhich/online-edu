export type JwtParams = {
    expire: string
    secret: string
}

export type JwtPayload = {
    email: string
}

export type Token = "accessToken" | "refreshToken"