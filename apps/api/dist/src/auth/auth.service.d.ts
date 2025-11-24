import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
