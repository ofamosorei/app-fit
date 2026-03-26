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
Crie um PLANO ALIMENTAR SEMANAL (7 DIAS, de Segunda a Domingo) para um paciente com as seguintes características:

- Peso: ${weight}kg | Altura: ${height}cm | Idade: ${age} anos | Sexo: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- Nível de Atividade: ${activityLevel === 'intense' ? 'Intenso (Atleta/Crossfit)' : activityLevel === 'moderate' ? 'Moderado (3 a 5x por semana)' : activityLevel === 'light' ? 'Leve (1 a 3x por semana)' : 'Sedentário (Nenhuma)'}
- Objetivo: ${goalLabel}
- META CALÓRICA DO DIA: APROXIMADAMENTE ${caloricTarget} kcal (TDEE realizado com fator de atividade: ${tdee} kcal${goal !== 'maintenance' ? `, déficit de ${tdee - caloricTarget} kcal` : ''}).

INFORMAÇÕES CLÍNICAS OBRIGATÓRIAS DE PROTEÇÃO:
- Condições de Saúde (Comorbidades): ${comorbidities || 'Nenhuma informada'}
- Uso de Medicamentos: ${medications || 'Nenhum informado'}

REGRAS:
1. ADAPTAÇÃO CLÍNICA: Se houver relato de Diabetes, reduza muito carboidratos simples. Hipertensão exige redução de sódio/industrializados. Se houver intolerância declarada, faça substituições devidas.
2. Você DEVE gerar EXATAMENTE 7 DIAS de cardápio.
3. Use alimentos simples, comuns e baratos no Brasil.
4. Para os dias de dieta (1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta):
   - OBRIGATÓRIO: Chá seca barriga deve existir em todos os dias de Segunda a Sexta, posicionado ANTES DO ALMOÇO ou ANTES DO JANTAR.
   - OBRIGATÓRIO: Suco Detox DEVE existir *obrigatoriamente* na Segunda(1), Quarta(3) e Sexta(5), posicionado de manhã, EM JEJUM (antes do café da manhã).
5. Sábado (6) e Domingo (0): Não há obrigação de Chá seca barriga ou Suco Detox (a menos que a caloria permita, mas preferencialmente não use, para deixar a dieta diferente no final de semana).
6. Refeições variadas a cada dia mas que sejam de fácil preparo (ex: ovos, frango, carne moída, salada, frutas).

Formato ESTRITO esperado de saída JSON:
{
  "waterTarget": ${weight * 35},
  "weeklyPlan": [
    {
      "dayOfWeek": 0,
      "dayName": "Domingo",
      "meals": [ { "time": "08:00", "title": "Café da manhã", "description": "...", "completed": false } ]
    },
    { "dayOfWeek": 1, "dayName": "Segunda-feira", "meals": [...] },
    { "dayOfWeek": 2, "dayName": "Terça-feira", "meals": [...] },
    { "dayOfWeek": 3, "dayName": "Quarta-feira", "meals": [...] },
    { "dayOfWeek": 4, "dayName": "Quinta-feira", "meals": [...] },
    { "dayOfWeek": 5, "dayName": "Sexta-feira", "meals": [...] },
    { "dayOfWeek": 6, "dayName": "Sábado", "meals": [...] }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
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
