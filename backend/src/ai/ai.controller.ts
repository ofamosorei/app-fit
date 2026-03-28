import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaidAccessGuard } from '../auth/paid-access.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, PaidAccessGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-plan')
  async generatePlan(
    @Body('weight') weight: number,
    @Body('height') height: number,
    @Body('age') age: number,
    @Body('sex') sex: 'male' | 'female',
    @Body('activityLevel') activityLevel: string,
    @Body('comorbidities') comorbidities: string,
    @Body('medications') medications: string,
    @Body('goal') goal: string,
  ) {
    return this.aiService.generatePlan(weight, height, age, sex, activityLevel, comorbidities, medications, goal);
  }

  @Post('analyze-meal')
  async analyzeMeal(@Body('image') imageBase64: string) {
    return this.aiService.analyzeMeal(imageBase64);
  }
}
