import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generatePlan(weight: number, height: number, age: number, sex: 'male' | 'female', activityLevel: string, comorbidities: string, medications: string, goal: string): Promise<{
        waterTarget: number;
        weeklyPlan: {
            dayOfWeek: number;
            dayName: string;
            meals: {
                time: string;
                title: string;
                description: string;
                completed: boolean;
            }[];
        }[];
    } | {
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
