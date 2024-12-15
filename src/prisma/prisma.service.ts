import { PrismaClient } from "@prisma/client";

export class PrismaService {
    private static prisma: PrismaClient;

    private constructor() {}

    public static async resolve() {
        if (!PrismaService.prisma) {
            PrismaService.prisma = new PrismaClient();

            await PrismaService.prisma.$connect();
        }

        return PrismaService.prisma;
    }
}
