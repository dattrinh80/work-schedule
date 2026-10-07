import { User } from '../types/models.js';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: User;
}

export interface UserProfileDto extends User {}

export interface ActiveScope {
  facilityId: string | 'ALL';
  facilityName?: string;
}
