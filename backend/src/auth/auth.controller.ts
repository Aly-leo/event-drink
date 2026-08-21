import { Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './strategies/jwt.strategy';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('mot-de-passe-oublie')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reinitialiser-mot-de-passe')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() currentUser: JwtPayload) {
    const user = await this.usersService.findById(currentUser.sub);
    if (!user) {
      return null;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() currentUser: JwtPayload, @Body() dto: UpdateMeDto) {
    if (dto.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== currentUser.sub) {
        throw new ConflictException('Un compte existe déjà avec cet email.');
      }
    }

    const updated = await this.usersService.update(currentUser.sub, dto);
    const { password, ...safeUser } = updated;
    return safeUser;
  }
}
