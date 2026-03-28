import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
export declare class AiService {
    private configService;
    private userService;
    private openai;
    constructor(configService: ConfigService, userService: UserService);
    generatePlanForUser(userId: string): Promise<{
        waterTarget: any;
        warnings: any;
        dailyMacros: any;
        weeklyPlan: any;
        shoppingList: any;
        summary: any;
    }>;
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
