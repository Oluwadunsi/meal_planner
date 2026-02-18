export function computeAdaptationRules(feedback: any[]): string[] {
  if (feedback.length === 0) return ['Generate a balanced, varied first week.']

  const rules: string[] = []
  const avgRating = feedback.reduce((s, f) => s + (f.weekly_rating ?? 3), 0) / feedback.length

  const mentionsBudget = feedback.some(f =>
    f.feedback_text?.toLowerCase().includes('expensive') ||
    f.feedback_text?.toLowerCase().includes('costly')
  )
  if (mentionsBudget) rules.push('Reduce cost this week. Prefer lentils, eggs, frozen veg, rice.')

  const mentionsComplex = feedback.some(f =>
    f.feedback_text?.toLowerCase().includes('complicated') ||
    f.feedback_text?.toLowerCase().includes('too long')
  )
  if (mentionsComplex) rules.push('Simplify all meals. Max 30 min prep. Prefer one-pan dishes.')

  if (avgRating < 3) rules.push('Previous weeks rated low. Introduce more variety and new cuisines.')
  if (avgRating >= 4.5) rules.push('Previous weeks rated highly. Maintain similar structure and cuisine balance.')

  const highMeals = feedback.flatMap(f =>
    Object.entries(f.meal_ratings ?? {})
      .filter(([, r]) => (r as number) >= 4)
      .map(([k]) => k)
  )
  if (highMeals.length > 0) {
    rules.push(`These meal types were rated highly — include similar ones: ${highMeals.slice(0, 3).join(', ')}`)
  }

  return rules.length > 0 ? rules : ['Maintain good variety. Continue current balance.']
}