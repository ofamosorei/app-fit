import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || 'mock_key',
    });
  }

  private calculateTDEE(weight: number, height: number, age: number, sex: 'male' | 'female', activityLevel: string): number {
    let bmr: number;
    if (sex === 'male') {
      bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
    } else {
      bmr = 447.6 + (9.25 * weight) + (3.1 * height) - (4.33 * age);
    }
    let factor = 1.2;
    if (activityLevel === 'light') factor = 1.375;
    else if (activityLevel === 'moderate') factor = 1.55;
    else if (activityLevel === 'intense') factor = 1.725;
    
    return Math.round(bmr * factor);
  }

  private getCaloricTarget(tdee: number, goal: string): number {
    if (goal === 'fast') return tdee - 500;
    if (goal === 'moderate') return tdee - 250;
    return tdee; // maintenance
  }

  async generatePlan(weight: number, height: number, age: number, sex: 'male' | 'female', activityLevel: string, comorbidities: string, medications: string, goal: string) {
    const isMock = this.configService.get('OPENAI_API_KEY') === 'your_openai_api_key_here' || !this.configService.get('OPENAI_API_KEY');
    if (isMock) {
      return this.getMockPlan(weight, goal);
    }

    const tdee = this.calculateTDEE(weight, height, age, sex, activityLevel);
    const caloricTarget = this.getCaloricTarget(tdee, goal);
    const goalLabel = goal === 'fast' ? 'emagrecimento rápido' : goal === 'moderate' ? 'perda moderada' : 'manutenção de peso';

    try {
      const prompt = `Você é uma nutricionista clínica e funcional especialista em emagrecimento.
Baseado no paciente: ${weight}kg, ${height}cm, ${age} anos, Sexo ${sex === 'male' ? 'Masculino' : 'Feminino'}. Nível: ${activityLevel}. Objetivo: ${goalLabel}. Meta calórica de ${caloricTarget} kcal diárias (Déficit incluído).

CRIE 3 PLANOS NUTRICIONAIS BASE (Plano A, Plano B, Plano C). O sistema no backend irá ler esses 3 planos e rotacioná-los automaticamente para preencher a semana inteira do paciente, então FOQUE apenas em criar 3 dias excelentes e variados.
Regras OBRIGATÓRIAS:
1. USE APENAS ALIMENTOS SIMPLES, FÁCEIS DE ENCONTRAR E BARATOS NO BRASIL (Ovos, frango, patinho moído, arroz, feijão, aveia, frutas básicas, etc). Nada caro ou importado.
2. Pratos focados em ${comorbidities || 'saúde'} e adaptados para ${medications || 'sem medicamentos especiais'}.
3. NÃO adicione chás nem suco detox no menu. (Nós do sistema faremos a adição nas datas certas).
4. Cada plano base deve ter APENAS as 4 refeições principais (Café da Manhã, Almoço, Lanche da Tarde, Jantar).

Formato ESTRITO JSON:
{
  "waterTarget": ${weight * 35},
  "basePlans": [
    {
      "meals": [ { "time": "08:00", "title": "Café da manhã", "description": "...", "completed": false } ]
    },
    { "meals": [...] },
    { "meals": [...] }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      });

      const responseText = response.choices[0].message.content || '{}';
      const parsedData = JSON.parse(responseText);

      // Mapear os 3 planos base para os 7 dias da semana
      const weeklyPlan = [];
      const basePlans = parsedData.basePlans || [];
      if (basePlans.length === 0) throw new Error('Falha ao gerar base plans');

      for (let i = 0; i < 7; i++) {
        const baseIndex = i % basePlans.length;
        const clonedMeals = JSON.parse(JSON.stringify(basePlans[baseIndex].meals));
        
        // Regra Dinâmica do Suco Detox: Segunda(1), Quarta(3) e Sexta(5) em jejum pela manhã
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
        
        // Regra Dinâmica do Chá: Segunda(1) a Quinta(4) antes do almoço (ou jantar)
        if ([1, 2, 3, 4].includes(i)) {
          const almoçoIndex = clonedMeals.findIndex((m: any) => m.title?.toLowerCase().includes('almoço') || m.type?.toLowerCase().includes('almoço')) || 1;
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

      return {
        waterTarget: parsedData.waterTarget || weight * 35,
        weeklyPlan
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('Failed to generate plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async analyzeMeal(imageBase64: string) {
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
      // STEP 1: GPT Vision identifies ingredients + estimates portions
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
      const ingredients: Array<{name: string; usdaSearchTerm: string; grams: number}> = visionData.ingredients || [];

      if (!ingredients.length) {
        throw new Error('No ingredients identified');
      }

      // STEP 2: For each ingredient, query USDA FoodData Central for accurate nutrition
      const usdaApiKey = this.configService.get('USDA_API_KEY');
      const nutritionResults: Array<{
        name: string;
        grams: number;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
      }> = [];

      for (const ingredient of ingredients) {
        try {
          // Search for the food in USDA database using the specific English term
          const searchTerm = ingredient.usdaSearchTerm || ingredient.name;
          const searchRes = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchTerm)}&api_key=${usdaApiKey}&pageSize=1&dataType=SR%20Legacy,Foundation`
          );
          const searchData = await searchRes.json() as any;
          const food = searchData.foods?.[0];

          if (food) {
            // Get macros per 100g from USDA, then scale to the estimated grams
            const getNutrient = (id: number): number => {
              const n = food.foodNutrients?.find((fn: any) => fn.nutrientId === id);
              return n?.value || 0;
            };

            const per100g = {
              calories: getNutrient(1008), // Energy (kcal)
              protein:  getNutrient(1003), // Protein
              carbs:    getNutrient(1005), // Carbohydrate, by difference
              fats:     getNutrient(1004), // Total lipid (fat)
            };

            const factor = ingredient.grams / 100;
            nutritionResults.push({
              name: ingredient.name,
              grams: ingredient.grams,
              calories: Math.round(per100g.calories * factor),
              protein:  Math.round(per100g.protein  * factor * 10) / 10,
              carbs:    Math.round(per100g.carbs    * factor * 10) / 10,
              fats:     Math.round(per100g.fats     * factor * 10) / 10,
            });
          } else {
            // USDA didn't find it - ask GPT to estimate this specific item
            nutritionResults.push({
              name: ingredient.name,
              grams: ingredient.grams,
              calories: Math.round((ingredient.grams / 100) * 150), // generic fallback
              protein: Math.round((ingredient.grams / 100) * 15),
              carbs:   Math.round((ingredient.grams / 100) * 15),
              fats:    Math.round((ingredient.grams / 100) * 5),
            });
          }
        } catch {
          // Skip failed lookup
        }
      }

      // STEP 3: Sum all ingredients
      const totals = nutritionResults.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein:  acc.protein  + item.protein,
        carbs:    acc.carbs    + item.carbs,
        fats:     acc.fats     + item.fats,
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      return {
        name: visionData.mealName || 'Refeição Analisada',
        calories: totals.calories,
        protein:  Math.round(totals.protein  * 10) / 10,
        carbs:    Math.round(totals.carbs    * 10) / 10,
        fats:     Math.round(totals.fats     * 10) / 10,
        ingredients: nutritionResults,
      };

    } catch (error) {
       console.error(error);
       throw new HttpException('Failed to analyze meal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getMockPlan(weight: number, goal: string) {
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
}
