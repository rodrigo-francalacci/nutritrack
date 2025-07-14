
// Database types for consistency across the application
export interface Ingredient {
  id: string
  name: string
  protein: number
  carbs: number
  fats: number
  calories: number
  fiber: number
  notes?: string | null
  image1?: string | SanityImageAsset | null  // Can be URL string (from API) or Sanity asset (for upload)
  image2?: string | SanityImageAsset | null  // Can be URL string (from API) or Sanity asset (for upload)
  createdAt: Date | string
  updatedAt: Date | string
  customUnits: CustomUnit[]
}

// Sanity image asset structure
export interface SanityImageAsset {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
}

export interface CustomUnit {
  id: string
  ingredientId: string
  unitName: string
  gramsEquivalent: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Recipe {
  id: string
  name: string
  instructions?: string | null
  photos?: any | null
  scalingFactor: number
  createdAt: Date | string
  updatedAt: Date | string
  ingredients: RecipeIngredient[]
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientId: string
  quantity: number
  unitId?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  recipe: Recipe
  ingredient: Ingredient
  unit?: CustomUnit | null
}

export interface Exercise {
  id: string
  name: string
  description?: string | null
  photo?: string | null
  video?: string | null
  musclesInvolved: string[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface WorkoutPlan {
  id: string
  name: string
  date: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  exercises: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  workoutPlanId: string
  exerciseId: string
  reps?: number | null
  series?: number | null
  weight?: number | null
  createdAt: Date | string
  updatedAt: Date | string
  workoutPlan: WorkoutPlan
  exercise: Exercise
}

export interface Habit {
  id: string
  name: string
  description?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  completions: HabitCompletion[]
}

export interface HabitCompletion {
  id: string
  habitId: string
  date: Date | string
  completed: boolean
  createdAt: Date | string
  updatedAt: Date | string
  habit: Habit
}

export interface DailyNutrition {
  id: string
  date: Date | string
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fats?: number | null
  fiber?: number | null
  water?: number | null
  notes?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DailyBodyMetrics {
  id: string
  date: Date | string
  weight?: number | null
  bodyFat?: number | null
  muscleMass?: number | null
  visceralFat?: number | null
  bmi?: number | null
  bodyWater?: number | null
  boneMass?: number | null
  basalMetabolism?: number | null
  notes?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}
