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
    async generatePlanForUser(userId) {
        const user = await this.userService.findById(userId);
        if (!user)
            throw new common_1.HttpException('Usuário não encontrado', common_1.HttpStatus.NOT_FOUND);
        const { weight, height, age, sex, activityLevel, comorbidities, medications, goal, allergies, dislikedFoods, targetWeight } = user;
        if (!weight || !height || !age || !sex) {
            throw new common_1.HttpException('Perfil incompleto. Preencha o onboarding.', common_1.HttpStatus.BAD_REQUEST);
        }
        const heightM = height / 100;
        const imc = weight / (heightM * heightM);
        if (imc < 18.5) {
            throw new common_1.HttpException('⚠️ Seu peso atual está abaixo do saudável. Não é seguro gerar um plano de emagrecimento para o seu perfil. Consulte um nutricionista.', common_1.HttpStatus.BAD_REQUEST);
        }
        const isMock = this.configService.get('OPENAI_API_KEY') === 'your_openai_api_key_here' || !this.configService.get('OPENAI_API_KEY');
        if (isMock)
            return this.getMockPlan(weight, goal);
        let bmr;
        if (sex === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        }
        else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        const activityFactors = {
            sedentary: 1.2, light: 1.375, moderate: 1.55, intense: 1.725
        };
        const tdee = Math.round(bmr * (activityFactors[activityLevel || 'sedentary'] || 1.2));
        let deficit = goal === 'fast' ? 750 : goal === 'moderate' ? 500 : 0;
        const minCalories = sex === 'male' ? 1500 : 1200;
        if (imc > 40)
            deficit = Math.min(deficit, 500);
        const caloricTarget = Math.max(tdee - deficit, minCalories);
        const actualDeficit = tdee - caloricTarget;
        const comorbiditiesLower = (comorbidities || '').toLowerCase();
        const hasDiabetes = ['diabetes', 'resistência à insulina', 'resistencia a insulina', 'glicemia', 'hipoglicemia'].some(k => comorbiditiesLower.includes(k));
        const hasHipertensao = ['hipertensão', 'hipertensao', 'pressão alta', 'pressao alta'].some(k => comorbiditiesLower.includes(k));
        const hasHipotireoidismo = ['hipotireoidismo', 'tireóide', 'tireoide'].some(k => comorbiditiesLower.includes(k));
        const hasRenalIssue = ['renal', 'rim', 'nefro'].some(k => comorbiditiesLower.includes(k));
        const medicationsLower = (medications || '').toLowerCase();
        const hasGlp1 = ['ozempic', 'mounjaro', 'wegovy', 'saxenda', 'metformina', 'rybelsus', 'victoza'].some(m => medicationsLower.includes(m));
        let mealsCount = 3;
        let mealsReason = '';
        if (hasDiabetes) {
            mealsCount = 5;
            mealsReason = 'Diabetes/hipoglicemia requer refeições fracionadas para controle glicêmico.';
        }
        else if (goal === 'fast' && (activityLevel === 'sedentary' || activityLevel === 'light')) {
            mealsCount = 3;
            mealsReason = 'Emagrecimento rápido com atividade baixa: 3 refeições maiores otimizam o déficit calórico.';
        }
        else if (goal === 'fast' && (activityLevel === 'moderate' || activityLevel === 'intense')) {
            mealsCount = 5;
            mealsReason = 'Emagrecimento rápido com atividade alta: 5 refeições preservam massa muscular.';
        }
        else if (goal === 'moderate' && activityLevel === 'sedentary') {
            mealsCount = 3;
            mealsReason = 'Perda moderada com sedentarismo: 3 refeições equilibradas são suficientes.';
        }
        else if (goal === 'moderate') {
            mealsCount = 5;
            mealsReason = 'Perda moderada com atividade: 5 refeições otimizam o metabolismo.';
        }
        else {
            mealsCount = 3;
            mealsReason = '3 refeições equilibradas para manutenção de peso.';
        }
        const mealsFormat = mealsCount === 5
            ? 'Café da Manhã (08:00), Lanche da Manhã (10:30), Almoço (12:30), Lanche da Tarde (16:00), Jantar (19:30)'
            : 'Café da Manhã (08:00), Almoço (12:30), Jantar (19:30)';
        const proteinG = Math.round(weight * 2);
        const fatCalories = Math.round(caloricTarget * 0.25);
        const fatG = Math.round(fatCalories / 9);
        const proteinCalories = proteinG * 4;
        const carbCalories = caloricTarget - proteinCalories - fatCalories;
        const carbG = Math.max(0, Math.round(carbCalories / 4));
        const warnings = [];
        if (imc > 40)
            warnings.push('⚠️ Seu IMC indica obesidade grave. Este plano é um suporte alimentar inicial. É fundamental que você busque acompanhamento médico e nutricional presencial antes de iniciar qualquer dieta.');
        if ((comorbidities && comorbidities.trim() !== '') || (medications && medications.trim() !== '')) {
            warnings.push('⚠️ Você informou condições médicas ou uso de medicamentos. Este plano é um guia alimentar geral e não substitui orientação profissional. Consulte seu médico ou nutricionista antes de iniciar.');
        }
        const restrictionRules = [];
        if (hasDiabetes)
            restrictionRules.push('DIABÉTICO/RESISTÊNCIA INSULÍNICA: Elimine açúcares simples, farinhas brancas, arroz branco, sucos de fruta e ultraprocessados. Use apenas carboidratos de baixo índice glicêmico (aveia, batata doce, arroz integral, leguminosas).');
        if (hasHipertensao)
            restrictionRules.push('HIPERTENSO: Zero embutidos, enlatados, temperos industrializados. Cozinhe sem sal extra, use ervas naturais. Evite alimentos com sódio acima de 600mg por porção.');
        if (hasHipotireoidismo)
            restrictionRules.push('HIPOTIREOIDISMO: Evite soja em excesso e vegetais crucíferos crus em grandes quantidades (brócolis, couve-flor, repolho). Prefira vegetais cozidos.');
        if (hasRenalIssue)
            restrictionRules.push('DOENÇA RENAL: Reduza proteína animal total do plano em 30%, elimine suplementos proteicos, evite alimentos ricos em potássio (banana, laranja, tomate) e fósforo (laticínios, feijão).');
        if (hasGlp1)
            restrictionRules.push('MEDICAÇÃO GLP-1/METFORMINA: Plano ajustado para complementar o efeito do medicamento com refeições menores e mais frequentes. Reforce consulta médica periodicamente.');
        if (medicationsLower.trim() !== '' && !hasGlp1)
            restrictionRules.push('MEDICAMENTO NÃO IDENTIFICADO: Aviso importante — consulte seu médico para verificar interações alimentares com o medicamento em uso.');
        const allergiesText = allergies && allergies.trim() !== ''
            ? `ALERGIAS — RESTRIÇÃO ABSOLUTA (NUNCA INCLUA EM NENHUMA REFEIÇÃO DE NENHUM DIA): ${allergies}`
            : 'Sem alergias reportadas.';
        const dislikedText = dislikedFoods && dislikedFoods.trim() !== ''
            ? `ALIMENTOS ODIADOS — RESTRIÇÃO FORTE (NUNCA INCLUA EM NENHUM DIA): ${dislikedFoods}`
            : 'Sem restrições de preferência.';
        const weeklyLossKg = actualDeficit > 0 ? parseFloat(((actualDeficit * 7) / 7700).toFixed(2)) : 0;
        const monthlyLossKg = parseFloat((weeklyLossKg * 4.3).toFixed(2));
        const weightDiff = Math.max(0, weight - (targetWeight || weight));
        const weeksToGoal = weeklyLossKg > 0 && weightDiff > 0 ? Math.ceil(weightDiff / weeklyLossKg) : 0;
        let adjustedTargetWeight = targetWeight || null;
        if (adjustedTargetWeight) {
            const targetImc = adjustedTargetWeight / (heightM * heightM);
            if (targetImc < 18.5) {
                adjustedTargetWeight = Math.ceil(18.5 * heightM * heightM);
            }
        }
        try {
            const prompt = `Você é um nutricionista virtual especializado em emagrecimento saudável. Nunca dê diagnósticos médicos. Nunca prescreva medicamentos. Nunca substitua acompanhamento profissional. Em caso de dúvida clínica, oriente sempre consulta a profissional de saúde.

## DADOS DO PACIENTE
- Biometria: ${weight}kg | ${height}cm | ${age} anos | Sexo: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- IMC: ${imc.toFixed(1)}${imc > 40 ? ' ⚠️ OBESIDADE GRAVE — déficit limitado a 500kcal' : ''}
- Nível de atividade: ${activityLevel}
- TDEE (Mifflin-St Jeor): ${tdee} kcal/dia
- META CALÓRICA DIÁRIA: ${caloricTarget} kcal (déficit aplicado: ${actualDeficit} kcal)
- METAS DE MACROS DIÁRIAS: Proteína ${proteinG}g | Carboidrato ${carbG}g | Gordura ${fatG}g
- Número de refeições: ${mealsCount} refeições por dia
- Motivo: ${mealsReason}
- Formato obrigatório: ${mealsFormat}
- Objetivo: ${goal === 'fast' ? 'Emagrecimento rápido' : goal === 'moderate' ? 'Perda moderada' : 'Manutenção'}
- Peso atual: ${weight}kg | Peso desejado: ${adjustedTargetWeight ? adjustedTargetWeight + 'kg' : 'não informado'}
- Histórico clínico: ${comorbidities || 'Nenhum'}
- Medicamentos em uso: ${medications || 'Nenhum'}
- ${allergiesText}
- ${dislikedText}

## RESTRIÇÕES CLÍNICAS OBRIGATÓRIAS
${restrictionRules.length > 0 ? restrictionRules.map(r => `- ${r}`).join('\n') : '- Nenhuma restrição clínica específica além das alergias.'}

## CÁLCULO DE MACROS (EXIBA NO INÍCIO DO PLANO)
Sua meta diária: ${caloricTarget} kcal | Proteína: ${proteinG}g | Carboidrato: ${carbG}g | Gordura: ${fatG}g

## FREQUÊNCIA DE REFEIÇÕES
Foram definidas ${mealsCount} refeições por dia com base no seu perfil (${mealsReason}).

## CALENDÁRIO SEMANAL FIXO — SIGO EXATAMENTE ESTE PADRÃO
- Segunda-feira (dayOfWeek=1): Incluir SUCO DETOX + CHÁ SECA BARRIGA
- Terça-feira (dayOfWeek=2): Incluir apenas CHÁ SECA BARRIGA
- Quarta-feira (dayOfWeek=3): Incluir SUCO DETOX + CHÁ SECA BARRIGA
- Quinta-feira (dayOfWeek=4): Incluir apenas CHÁ SECA BARRIGA
- Sexta-feira (dayOfWeek=5): Incluir apenas SUCO DETOX
- Sábado (dayOfWeek=6): Nenhum dos dois
- Domingo (dayOfWeek=0): Nenhum dos dois

SUCO DETOX (quando aplicável): insira como PRIMEIRA refeição com time="06:30", title="Suco Detox", description="🥬 Tome em jejum assim que acordar. Receita: 1 folha de couve + ½ maçã + suco de 1 limão + 200ml de água. Bater e tomar imediatamente. Aguarde 20 minutos antes do café da manhã."

CHÁ SECA BARRIGA (quando aplicável): insira imediatamente ANTES do almoço com time="12:00", title="Chá Seca Barriga", description="🍵 Tome 1 xícara 30 minutos antes do almoço: chá verde, hibisco ou cavalinha. Sem açúcar."

## REGRAS DE QUALIDADE DO CARDÁPIO
1. Use APENAS alimentos simples, baratos e acessíveis no Brasil: frango, peixe, ovos, carne moída magra, arroz integral, aveia, batata doce, feijão, lentilha, frutas comuns, verduras de mercado.
2. NUNCA repita o mesmo prato principal em dias consecutivos.
3. Varie as fontes de proteína ao longo da semana: frango, ovo, peixe, carne vermelha magra, leguminosas.
4. Varie os carboidratos: batata doce, arroz integral, mandioca, aveia, inhame.
5. Para cada refeição principal (café, almoço, jantar) inclua: alimentos + quantidades em gramas + calorias estimadas + dica de preparo "💡 [dica]".
6. A soma calórica de cada dia deve ser PRÓXIMA de ${caloricTarget} kcal.
7. Os lanches podem se repetir mas não em dias consecutivos.

## ESTRUTURA ESPERADA DO JSON (siga exatamente)
{
  "waterTarget": ${weight * 35},
  "warnings": ${JSON.stringify(warnings)},
  "dailyMacros": { "calories": ${caloricTarget}, "protein": ${proteinG}, "carbs": ${carbG}, "fat": ${fatG} },
  "weeklyPlan": [
    {
      "dayOfWeek": 0,
      "meals": [
        { "time": "HH:MM", "title": "Nome da Refeição", "description": "Descrição detalhada com quantidades, calorias e dica", "completed": false }
      ]
    },
    ... (repita para dayOfWeek 1 até 6)
  ],
  "shoppingList": {
    "proteinas": ["Frango filé (700g)", "Ovos (1 dúzia)", ...],
    "carboidratos": ["Aveia (500g)", "Batata doce (1kg)", ...],
    "vegetaisEFolhas": ["Couve (1 maço)", ...],
    "frutas": ["Banana (1kg)", ...],
    "gordurasEOleaginosas": ["Azeite de oliva (250ml)", ...],
    "temperosECondimentos": ["Alho", "Limão", ...],
    "outros": [...]
  },
  "summary": {
    "dailyCalories": ${caloricTarget},
    "deficit": ${actualDeficit},
    "weeklyLossKg": ${weeklyLossKg},
    "monthlyLossKg": ${monthlyLossKg},
    "weeksToGoal": ${weeksToGoal}
  }
}

GERE OS 7 DIAS COMPLETOS (dayOfWeek 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb). Aplique o calendário de Suco Detox e Chá RIGOROSAMENTE. Retorne APENAS o JSON, sem texto antes ou depois.`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                response_format: { type: 'json_object' },
                max_tokens: 6000,
            });
            const responseText = response.choices[0].message.content || '{}';
            const parsedData = JSON.parse(responseText);
            const weeklyPlan = (parsedData.weeklyPlan || [])
                .map((day) => ({
                ...day,
                meals: (day.meals || []).map((m) => ({ ...m, completed: false }))
            }))
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
            const finalPlan = {
                waterTarget: parsedData.waterTarget || weight * 35,
                warnings: parsedData.warnings || warnings,
                dailyMacros: parsedData.dailyMacros || { calories: caloricTarget, protein: proteinG, carbs: carbG, fat: fatG },
                weeklyPlan,
                shoppingList: parsedData.shoppingList || {},
                summary: parsedData.summary || { dailyCalories: caloricTarget, deficit: actualDeficit, weeklyLossKg, monthlyLossKg, weeksToGoal }
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
            return { name: "Prato Saudável Simulado", calories: 350, protein: 30, carbs: 40, fats: 10, ingredients: [] };
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
- Para frutas, verduras e legumes frescos, inclua a palavra "raw" antes do nome (Ex: "raw banana", "raw apple"). Se esquecer o "raw", o sistema buscará a versão desidratada que tem 10x mais calorias!
- Para carnes, especifique o preparo (Ex: "grilled chicken breast", "roasted beef").

Retorne um JSON neste EXATO formato:
{
  "mealName": "Nome do Prato",
  "ingredients": [
    { "name": "arroz branco cozido", "usdaSearchTerm": "cooked white rice", "grams": 120 },
    { "name": "frango grelhado", "usdaSearchTerm": "grilled chicken breast", "grams": 150 }
  ]
}
Seja realista nas quantidades. Retorne SOMENTE o JSON.`
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
            if (!ingredients.length)
                throw new Error('No ingredients identified');
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
                catch { }
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
            { time: "06:30", title: "Suco Detox", description: "🥬 Tome em jejum: 1 folha de couve + ½ maçã + suco de 1 limão + 200ml de água. Aguarde 20min.", completed: false },
            { time: "08:00", title: "Café da manhã", description: "2 ovos mexidos (140kcal) + café sem açúcar. 💡 Mexa os ovos em frigideira antiaderente sem óleo.", completed: false },
            { time: "12:00", title: "Chá Seca Barriga", description: "🍵 1 xícara de chá verde ou hibisco sem açúcar, 30min antes do almoço.", completed: false },
            { time: "12:30", title: "Almoço", description: "Frango grelhado (120g, 200kcal) + salada à vontade + arroz integral (3 col). 💡 Tempere o frango com limão e alho.", completed: false },
            { time: "16:00", title: "Lanche da Tarde", description: "Iogurte natural (150g, 90kcal) + 1 fruta. 💡 Prefira frutas com baixo índice glicêmico.", completed: false },
            { time: "19:30", title: "Jantar", description: "Omelete simples (2 ovos, 140kcal) + legumes cozidos. 💡 Adicione cúrcuma aos ovos para potencial anti-inflamatório.", completed: false }
        ];
        return {
            waterTarget: weight * 35,
            warnings: [],
            dailyMacros: { calories: weight * 20, protein: weight * 2, carbs: 150, fat: 50 },
            weeklyPlan: [
                { dayOfWeek: 0, meals: baseDay.filter(m => !m.title.includes('Suco') && !m.title.includes('Chá')) },
                { dayOfWeek: 1, meals: baseDay },
                { dayOfWeek: 2, meals: baseDay.filter(m => !m.title.includes('Suco')) },
                { dayOfWeek: 3, meals: baseDay },
                { dayOfWeek: 4, meals: baseDay.filter(m => !m.title.includes('Suco')) },
                { dayOfWeek: 5, meals: baseDay.filter(m => !m.title.includes('Chá Seca')) },
                { dayOfWeek: 6, meals: baseDay.filter(m => !m.title.includes('Suco') && !m.title.includes('Chá')) },
            ],
            shoppingList: {},
            summary: { dailyCalories: weight * 20, deficit: 500, weeklyLossKg: 0.45, monthlyLossKg: 1.9, weeksToGoal: 0 }
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