import { JwtService } from '@nestjs/jwt';
import { LoginDto, LoginResponseDto, User } from '@wms/shared';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: LoginDto): Promise<LoginResponseDto>;
    validateUser(userId: string): Promise<User>;
}
