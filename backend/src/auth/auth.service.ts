import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Hash password (encrypt it)
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create new user
        const user = this.userRepository.create({
            email: registerDto.email,
            password: hashedPassword,
        });

        // Save to database
        await this.userRepository.save(user);

        // Return success (don't return password!)
        return { message: 'User registered successfully', userId: user.id };
    }

    async login(loginDto: LoginDto) {
        // Find user by email
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });

        // Check if user exists and password matches
        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Create JWT token
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        return { access_token: token, user: { id: user.id, email: user.email, role: user.role } };
    }
}