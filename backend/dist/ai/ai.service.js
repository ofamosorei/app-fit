"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const config_1 = require("@nestjs/config");
const user_service_1 = require("../user/user.service");
let AiService = class AiService {
    configService;
    userService;
    openai;
    constructor(configService, userService) {
        this.configService = configService;
        this.userService = userService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || 'mock_key',
        });
    }
    calculateTDEE(weight, height, age, sex, activityLevel) {
        let bmr;
        if (sex === 'male') {
            bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
        }
        else {
            bmr = 447.6 + (9.25 * weight) + (3.1 * height) - (4.33 * age);
        }
        let factor = 1.2;
        if (activityLevel === 'light')
            factor = 1.375;
        else if (activityLevel === 'moderate')
            factor = 1.55;
        else if (activityLevel === 'intense')
            factor = 1.725;
        return Math.round(bmr * factor);
    }
    getCaloricTarget(tdee, goal) {
        if (goal === 'fast')
            return tdee - 500;
        if (goal === 'moderate')
            return tdee - 250;
        return tdee;
    }
    async generatePlanForUser(userId) {
        const user = await this.userService.findById(userId);
        if (!user)
            throw new common_1.HttpException('Usuário não encontrado', common_1.HttpStatus.NOT_FOUND);
        const { weight, height, age, sex, activityLevel, comorbidities, medications, goal, allergies, dislikedFoods, mealsPerDay } = user;
        if (!weight || !height || !age || !sex) {
            throw new common_1.HttpException('Perfil incompleto. Preencha o onboarding.', common_1.HttpStatus.BAD_REQUEST);
        }
        const isMock = this.configService.get('OPENAI_API_KEY') === 'your_openai_api_key_here' || !this.configService.get('OPENAI_API_KEY');
        if (isMock) {
            return this.getMockPlan(weight, goal);
        }
        const tdee = this.calculateTDEE(weight, height, age, sex, activityLevel);
        const caloricTarget = this.getCaloricTarget(tdee, goal);
        const goalLabel = goal === 'fast' ? 'emagrecimento rápido' : goal === 'moderate' ? 'perda moderada' : 'manutenção de peso';
        const allergiesText = allergies && allergies.trim() !== '' ? `Alergias/Intolerâncias: ${allergies}.` : 'Sem alergias.';
        const dislikedFoodsText = dislikedFoods && dislikedFoods.trim() !== '' ? `Alimentos que ODEIA e NÃO PODE CONTER DE FORMA ALGUMA: ${dislikedFoods}.` : '';
        const mealsFormat = mealsPerDay === '5' ? 'Café da Manhã, Lanche da Manhã, Almoço, Lanche da Tarde e Jantar (5 refeições)' : 'Café da Manhã, Almoço, Lanche da Tarde e Jantar (4 refeições)';
        try {
            const prompt = `Você é uma Nutricionista Funcional, Esportiva e Clínica de Elite, renomada por criar dietas altamente eficientes, saborosas e seguras para resultados expressivos.

## DADOS DO PACIENTE OBRIGATÓRIOS
- Biometria: ${weight}kg, ${height}cm, ${age} anos, Sexo ${sex === 'male' ? 'Masculino' : 'Feminino'}.
- Nível de Atividade: ${activityLevel}.
- Objetivo: **${goalLabel.toUpperCase()}**. Meta calórica fixada em: **${caloricTarget} kcal diárias**.
- Histórico Clínico: ${comorbidities || 'Nenhum'}.
- Uso de Medicação: ${medications || 'Nenhum'}.
- **${allergiesText}** (RESTRIÇÃO ABSOLUTA, AJA COM RESPONSABILIDADE MÉDICA).
- **${dislikedFoodsText}**

## SUA TAREFA
Elabore 3 PLANOS NUTRICIONAIS BASE (Plano A, Plano B, Plano C) com EXATAMENTE ${caloricTarget} kcal cada. Esses planos serão rotacionados automaticamente durante a semana no seu App para o paciente.
Formato de refeições obrigatório: **${mealsFormat}**.

## REGRAS DE OURO DA DIETA (CRÍTICO)
1. **Acessibilidade Absoluta**: O paciente mora no Brasil. NÃO crie receitas gourmet com ingredientes caros ou difíceis de encontrar ("salmão do alasca", "mirtilos", "leite de amêndoas puro", etc). Use ovos, frango, carne moída, arroz, feijão, aveia, frutas comuns, pão integral.
2. **Qualidade Premium**: O prato deve parecer gostoso na descrição. Exemplo: Em vez de "Frango cozido", use "Filé de frango temperado na chapa com crosta leve e legumes assados".
3. NÃO adicione sucos detox ou chás termogênicos de manhã/almoço, o Sistema fará isso depois automaticamente!
4. Respeite IMPRESCINDIVELMENTE as alergias e alimentos odiados.

Retorne no formato ESTRITO JSON:
{
  "waterTarget": ${weight * 35},
  "basePlans": [
    {
      "meals": [ { "time": "08:00", "title": "Café da manhã", "description": "...", "completed": false } ]
    },
    { "meals": [ ... ] },
    { "meals": [ ... ] }
  ]
}`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                response_format: { type: "json_object" }
            });
            const responseText = response.choices[0].message.content || '{}';
            const parsedData = JSON.parse(responseText);
            const weeklyPlan = [];
            const basePlans = parsedData.basePlans || [];
            if (basePlans.length === 0)
                throw new Error('Falha ao gerar base plans');
            for (let i = 0; i < 7; i++) {
                const baseIndex = i % basePlans.length;
                const clonedMeals = JSON.parse(JSON.stringify(basePlans[baseIndex].meals));
                if ([1, 3, 5].includes(i)) {
                    clonedMeals.unshift({
                        type: "Desjejum",
                        time: "06:30",
                        name: "Suco Detox Seca Barriga",
                        description: "1 folha de couve, 1/2 maçã, 1 limão espremido e 200ml de água (Bater e beber em jejum)",
                        calories: 60,
                        protein: 2,
                        carbs: 14,
                        fat: 0,
                        completed: false
                    });
                }
                if ([1, 2, 3, 4].includes(i)) {
                    const almoçoIndex = clonedMeals.findIndex((m) => m.title?.toLowerCase().includes('almoço') || m.type?.toLowerCase().includes('almoço')) || 1;
                    const finalInsertIndex = almoçoIndex > -1 ? almoçoIndex : 1;
                    clonedMeals.splice(finalInsertIndex, 0, {
                        type: "Lanche",
                        time: "11:30",
                        name: "Chá Termogênico Padrão",
                        description: "1 xícara de Chá Verde, Hibisco ou Cavalinha sem açúcar (Para acelerar o metabolismo)",
                        calories: 5,
                        protein: 0,
                        carbs: 1,
                        fat: 0,
                        completed: false
                    });
                }
                weeklyPlan.push({
                    dayOfWeek: i,
                    meals: clonedMeals
                });
            }
            const finalPlan = {
                waterTarget: parsedData.waterTarget || weight * 35,
                weeklyPlan
            };
            await this.userService.updateProfile(user.id, { plan: finalPlan });
            return finalPlan;
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('Failed to generate plan', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeMeal(imageBase64) {
        const isMock = this.configService.get('OPENAI_API_KEY') === 'your_openai_api_key_here' || !this.configService.get('OPENAI_API_KEY');
        if (isMock) {
            return {
                name: "Prato Saudável Simulado",
                calories: 350,
                protein: 30,
                carbs: 40,
                fats: 10,
                ingredients: []
            };
        }
        try {
            const visionResponse = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analise esta imagem de uma refeição brasileira. Identifique CADA ingrediente separado e estime o peso em gramas de cada um.
Para maior precisão na busca de banco de dados, você DEVE fornecer também um termo de busca em INGLÊS chamado 'usdaSearchTerm'.
REGRA DE OURO PARA O TERMO EM INGLÊS:
- Para frutas, verduras e legumes frescos, você DEVE INCLUIR a palavra "raw" antes do nome (Ex: "raw banana", "raw apple", "raw onion"). Se você esquecer o "raw", o sistema buscará a versão desidratada que tem 10x mais calorias!
- Para carnes, especifique o preparo (Ex: "grilled chicken breast", "roasted beef").

Retorne um JSON neste EXATO formato:
{
  "mealName": "Nome do Prato",
  "ingredients": [
    { "name": "4 bananas", "usdaSearchTerm": "raw banana", "grams": 400 },
    { "name": "arroz branco cozido", "usdaSearchTerm": "cooked white rice", "grams": 120 },
    { "name": "frango grelhado", "usdaSearchTerm": "grilled chicken breast", "grams": 150 }
  ]
}
Seja realista nas quantidades de gramas (Lembre-se: 1 banana média = 100g, 4 bananas = 400g). Retorne SOMENTE o JSON.`
                            },
                            { type: 'image_url', image_url: { url: imageBase64 } }
                        ]
                    }
                ],
                response_format: { type: "json_object" },
                max_tokens: 500,
            });
            const visionData = JSON.parse(visionResponse.choices[0].message.content || '{}');
            const ingredients = visionData.ingredients || [];
            if (!ingredients.length) {
                throw new Error('No ingredients identified');
            }
            const usdaApiKey = this.configService.get('USDA_API_KEY');
            const nutritionResults = [];
            for (const ingredient of ingredients) {
                try {
                    const searchTerm = ingredient.usdaSearchTerm || ingredient.name;
                    const searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchTerm)}&api_key=${usdaApiKey}&pageSize=1&dataType=SR%20Legacy,Foundation`);
                    const searchData = await searchRes.json();
                    const food = searchData.foods?.[0];
                    if (food) {
                        const getNutrient = (id) => {
                            const n = food.foodNutrients?.find((fn) => fn.nutrientId === id);
                            return n?.value || 0;
                        };
                        const per100g = {
                            calories: getNutrient(1008),
                            protein: getNutrient(1003),
                            carbs: getNutrient(1005),
                            fats: getNutrient(1004),
                        };
                        const factor = ingredient.grams / 100;
                        nutritionResults.push({
                            name: ingredient.name,
                            grams: ingredient.grams,
                            calories: Math.round(per100g.calories * factor),
                            protein: Math.round(per100g.protein * factor * 10) / 10,
                            carbs: Math.round(per100g.carbs * factor * 10) / 10,
                            fats: Math.round(per100g.fats * factor * 10) / 10,
                        });
                    }
                    else {
                        nutritionResults.push({
                            name: ingredient.name,
                            grams: ingredient.grams,
                            calories: Math.round((ingredient.grams / 100) * 150),
                            protein: Math.round((ingredient.grams / 100) * 15),
                            carbs: Math.round((ingredient.grams / 100) * 15),
                            fats: Math.round((ingredient.grams / 100) * 5),
                        });
                    }
                }
                catch {
                }
            }
            const totals = nutritionResults.reduce((acc, item) => ({
                calories: acc.calories + item.calories,
                protein: acc.protein + item.protein,
                carbs: acc.carbs + item.carbs,
                fats: acc.fats + item.fats,
            }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
            return {
                name: visionData.mealName || 'Refeição Analisada',
                calories: totals.calories,
                protein: Math.round(totals.protein * 10) / 10,
                carbs: Math.round(totals.carbs * 10) / 10,
                fats: Math.round(totals.fats * 10) / 10,
                ingredients: nutritionResults,
            };
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('Failed to analyze meal', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getMockPlan(weight, goal) {
        const baseDay = [
            { time: "07:00", title: "Suco Detox Verde", description: "Couve, limão, maçã e gengibre", completed: false },
            { time: "09:00", title: "Café da manhã", description: "2 ovos mexidos com café sem açúcar", completed: false },
            { time: "12:30", title: "Almoço", description: "Frango grelhado (120g) com salada à vontade e 2 colheres de arroz", completed: false },
            { time: "16:00", title: "Lanche", description: "Iogurte natural com um fio de mel e chia", completed: false },
            { time: "19:00", title: "Chá Seca Barriga", description: "Chá de hibisco com canela (antes do jantar)", completed: false },
            { time: "19:30", title: "Jantar", description: "Sopa de legumes leve ou omelete simples", completed: false }
        ];
        const weekendDay = [
            { time: "09:00", title: "Café da manhã Reforçado", description: "Pão de queijo com café e ovos", completed: false },
            { time: "13:30", title: "Almoço Livre Controlado", description: "Macarrão ao molho vermelho com carne moída", completed: false },
            { time: "19:00", title: "Jantar Leve", description: "Misto quente integral", completed: false }
        ];
        return {
            waterTarget: weight * 35,
            weeklyPlan: [
                { dayOfWeek: 0, dayName: "Domingo", meals: weekendDay },
                { dayOfWeek: 1, dayName: "Segunda-feira", meals: baseDay },
                { dayOfWeek: 2, dayName: "Terça-feira", meals: baseDay },
                { dayOfWeek: 3, dayName: "Quarta-feira", meals: baseDay },
                { dayOfWeek: 4, dayName: "Quinta-feira", meals: baseDay },
                { dayOfWeek: 5, dayName: "Sexta-feira", meals: baseDay },
                { dayOfWeek: 6, dayName: "Sábado", meals: weekendDay }
            ]
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_service_1.UserService])
], AiService);
//# sourceMappingURL=ai.service.js.map