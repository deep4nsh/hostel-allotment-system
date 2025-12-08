import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;

            // Enforce Role Access Control
            if (user.role === 'ADMIN' && user.email !== 'admin@dtu.ac.in') return null;
            if (user.role === 'WARDEN' && user.email !== 'warden@dtu.ac.in') return null;

            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(registerDto: RegisterDto) {
        // Enforce Role Registration Restriction
        if (registerDto.role === 'ADMIN' && registerDto.email !== 'admin@dtu.ac.in') {
            throw new UnauthorizedException('Invalid email for Admin role');
        }
        if (registerDto.role === 'WARDEN' && registerDto.email !== 'warden@dtu.ac.in') {
            throw new UnauthorizedException('Invalid email for Warden role');
        }

        // Check if user exists
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        try {
            // Create user and associated student record
            return await this.usersService.create({
                email: registerDto.email,
                password: registerDto.password,
                role: registerDto.role || 'STUDENT',
            }).then(async (user) => {
                // Create empty student record
                await this.prisma.student.create({
                    data: {
                        userId: user.id,
                        name: registerDto.name || '', // Use provided name or empty string
                        gender: 'OTHER', // Default
                    },
                });
                return user;
            });
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Registration failed');
        }
    }
}
