import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, User } from '@wms/shared';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<LoginResponseDto>;
    getProfile(user: User): Promise<User>;
}
