import { User } from '../types/models.js';
export interface LoginDto {
    email: string;
    password: string;
}
export interface LoginResponseDto {
    accessToken: string;
    user: User;
}
export interface UserProfileDto extends User {
}
//# sourceMappingURL=auth.contract.d.ts.map