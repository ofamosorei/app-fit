import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generatePlan(req: any): Promise<{
        waterTarget: any;
        weeklyPlan: {
            dayOfWeek: number;
            meals: any;
        }[];
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
}
