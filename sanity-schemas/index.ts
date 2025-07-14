
// Export all Sanity schemas for future migration to Vercel/Sanity
import { ingredient } from './ingredient'
import { customUnit } from './custom-unit'
import { recipe } from './recipe'
import { recipeIngredient } from './recipe-ingredient'
import { exercise } from './exercise'
import { workoutPlan } from './workout-plan'
import { workoutExercise } from './workout-exercise'
import { habit } from './habit'
import { habitCompletion } from './habit-completion'
import { dailyNutrition } from './daily-nutrition'
import { dailyBodyMetrics } from './daily-body-metrics'

export const schemaTypes = [
  ingredient,
  customUnit,
  recipe,
  recipeIngredient,
  exercise,
  workoutPlan,
  workoutExercise,
  habit,
  habitCompletion,
  dailyNutrition,
  dailyBodyMetrics,
]

export {
  ingredient,
  customUnit,
  recipe,
  recipeIngredient,
  exercise,
  workoutPlan,
  workoutExercise,
  habit,
  habitCompletion,
  dailyNutrition,
  dailyBodyMetrics,
}
