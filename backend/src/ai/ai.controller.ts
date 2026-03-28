import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaidAccessGuard } from '../auth/paid-access.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, PaidAccessGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-plan')
  async generatePlan(@Request() req: any) {
    return this.aiService.generatePlanForUser(req.user.id);
  }

  @Post('analyze-meal')
  async analyzeMeal(@Body('image') imageBase64: string) {
    return this.aiService.analyzeMeal(imageBase64);
  }
}
