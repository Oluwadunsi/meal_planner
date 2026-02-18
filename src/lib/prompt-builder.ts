export function buildMealPlanPrompt({
  household,
  members,
  recentFeedback,
  adaptationRules,
}: {
  household: any
  members: any[]
  recentFeedback: any[]
  adaptationRules: string[]
}): string {
  const memberSummary = members.map(m =>
    `- ${m.name}: ${m.dietary_constraints.join(', ') || 'no restrictions'}, ` +
    `dislikes: ${m.disliked_ingredients.join(', ') || 'none'}, ` +
    `likes: ${m.liked_ingredients?.join(', ') || 'none'}, ` +
    `spice tolerance: ${m.spice_tolerance}, ` +
    `STRONGLY PREFERS these cuisines: ${m.cuisine_preferences.join(', ') || 'no preference'}`
  ).join('\n')

  const feedbackSummary = recentFeedback.length === 0
    ? 'No prior feedback — generate a balanced first week.'
    : recentFeedback.map(f =>
        `Week of ${f.week_start}: rated ${f.weekly_rating}/5. Notes: ${f.feedback_text || 'none'}`
      ).join('\n')
  
  const planDays = household.plan_days ?? 7
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, planDays)

  const weeklyBudgetContext = household.monthly_budget_sek
  ? `Monthly budget: ${household.monthly_budget_sek} SEK (~${Math.floor(household.monthly_budget_sek / 4)} SEK per week)`
  : `Budget level: ${household.budget_level}`

return `
You are a household meal planner for a ${household.household_size}-person household in ${household.city}.
Budget level: ${household.budget_level}. Cooking time preference: ${household.cooking_time}.

HOUSEHOLD MEMBERS:
${memberSummary}

RECENT FEEDBACK (adapt based on this):
${feedbackSummary}

ADAPTATION RULES THIS WEEK:
${adaptationRules.join('\n')}

RULES:
- Generate exactly ${planDays} days: ${dayNames.join(', ')}
- The meals array must contain exactly ${planDays} items, no more, no less
- Each day must have breakfast, lunch, and dinner
- Use affordable, realistic grocery store ingredients
- Reuse ingredients across meals to minimize waste and cost
- Avoid any disliked ingredients from ALL members
- Respect all dietary constraints from ALL members
'- Prioritize cuisine preferences of household members above all else',
'- The cuisine that the household members prefer most, the majority of meals should be from it',
'- Only introduce other cuisines if no member has a strong preference against them',
'- Cuisine variety is secondary to member preferences',
- Midweek meals (Tuesday–Thursday) should be simpler to prepare
- Meals should match the cooking time preference: ${household.cooking_time}

GROCERY LIST RULES:
- Every item MUST include a "category" field
- category must be exactly one of: protein, produce, dairy, pantry, other
- Always lowercase
- protein = meat, fish, eggs, tofu
- produce = vegetables, fruits, fresh herbs
- dairy = milk, cheese, butter, yogurt, cream
- pantry = rice, pasta, canned goods, spices, oil, sauces, dry goods
- other = anything that does not fit above
- In the "used_in" field, list ALL meals that use this ingredient to show reuse
- If an ingredient appears in 3+ meals, that\'s good — it means less waste

INGREDIENT REUSE RULES:
- Explicitly design meals to share ingredients across multiple days
- When planning Monday dinner with chicken, also use chicken in Tuesday lunch or Wednesday dinner
- If using tomatoes on Monday, incorporate them into at least 2 other meals'
- Mention ingredient carryover in meal descriptions
- Example: "Grilled Chicken Salad (using leftover chicken from Monday dinner)"
- Example: "Tomato Pasta (using tomatoes from Monday\'s salad)"
- Prioritize base ingredients that work in multiple cuisines: rice, chicken, tomatoes, onions, garlic

'COOKING TIME ACCURACY RULES:',
'- Breakfast: 5-20 minutes maximum (unless explicitly leisurely cooking time)',
'- Lunch: 10-30 minutes maximum',
'- Dinner: 20-45 minutes maximum (can go to 60 for leisurely)',
'- Time includes: active prep + cooking, NOT passive time like marinating overnight',
'- If a recipe needs 40+ minutes, it must be realistic: roasting, slow cooking, baking',
'- Do NOT claim 5 minutes for recipes that require chopping, sautéing, and simmering',
'- Simple examples: toast (5min), scrambled eggs (10min), pasta with sauce (20min), roast chicken (50min)',

EXAMPLE grocery items:
{ "item": "chicken breast", "quantity": "1kg", "unit": "kg", "category": "protein", "used_in": ["Mon dinner"] }
{ "item": "tomatoes", "quantity": "4", "unit": "pieces", "category": "produce", "used_in": ["Mon lunch"] }
{ "item": "milk", "quantity": "1L", "unit": "liters", "category": "dairy", "used_in": ["Tue breakfast"] }
{ "item": "rice", "quantity": "500g", "unit": "grams", "category": "pantry", "used_in": ["Wed lunch"] }
{ "item": "soy sauce", "quantity": "1", "unit": "bottle", "category": "pantry", "used_in": ["Thu dinner"] }

OUTPUT RULES:
- Respond ONLY with a valid JSON object
- No markdown, no code fences, no explanation, just raw JSON
- Follow this exact structure:

{
  "week_start": "YYYY-MM-DD",
  "meals": [
    {
      "day": "Monday",
      "breakfast": { "name": "...", "time_minutes": 10, "description": "..." },
      "lunch": { "name": "...", "time_minutes": 20, "description": "..." },
      "dinner": { "name": "...", "time_minutes": 30, "description": "..." }
    }
  ],
  "grocery_list": [
    { "item": "chicken breast", "quantity": "1kg", "unit": "kg", "category": "protein", "used_in": ["Mon dinner"] }
  ],
  "metadata": {
    "cuisine_distribution": { "Swedish": 3, "Italian": 2, "Nigerian": 2 },
    "estimated_cost": "820 SEK"
  }
}
`.trim()
}