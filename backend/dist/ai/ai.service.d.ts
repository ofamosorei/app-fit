import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    private calculateTDEE;
    private getCaloricTarget;
    generatePlan(weight: number, height: number, age: number, sex: 'male' | 'female', activityLevel: string, comorbidities: string, medications: string, goal: string): Promise<any>;
    analyzeMeal(imageBase64: string): Promise<{
        name: any;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        ingredients: {
            name: string;
            grams: number;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        }[];
    }>;
    private getMockPlan;
}
