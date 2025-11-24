import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'admin1@caffio.com' },
        password: { type: 'string', example: 'Admin123!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  @Post('signup')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'newcafe@caffio.com' },
        password: { type: 'string', example: 'SecurePass123!' },
        cafeName: { type: 'string', example: 'My Coffee Shop' },
        address: { type: 'string', example: '123 Main St, Sydney NSW' },
        lat: { type: 'number', example: -33.8688 },
        lon: { type: 'number', example: 151.2093 },
        primaryColor: { type: 'string', example: '#8B4513' },
        secondaryColor: { type: 'string', example: '#D2691E' },
        accentColor: { type: 'string', example: '#CD853F' },
        logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
        theme: { type: 'string', example: 'brown' },
      },
      required: ['email', 'password', 'cafeName'],
    },
  })
  @ApiResponse({ status: 201, description: 'Signup successful' })
  @ApiResponse({ status: 401, description: 'Email already registered' })
  async signup(
    @Body()
    body: {
      email: string;
      password: string;
      cafeName: string;
      address?: string;
      lat?: number;
      lon?: number;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      logoUrl?: string;
      theme?: string;
    },
  ) {
    try {
      return await this.authService.signup(body);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Signup failed');
    }
  }
}

