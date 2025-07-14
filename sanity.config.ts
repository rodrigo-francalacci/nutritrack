
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity-schemas'

export default defineConfig({
  name: 'default',
  title: 'NutriTrack',
  
  projectId: 'b3qo0k1z',
  dataset: 'production',
  
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Nutrition & Recipes
            S.listItem()
              .title('🥗 Nutrition')
              .child(
                S.list()
                  .title('Nutrition Management')
                  .items([
                    S.listItem()
                      .title('Ingredients')
                      .schemaType('ingredient')
                      .child(S.documentTypeList('ingredient')),
                    S.listItem()
                      .title('Custom Units')
                      .schemaType('customUnit')
                      .child(S.documentTypeList('customUnit')),
                    S.listItem()
                      .title('Recipes')
                      .schemaType('recipe')
                      .child(S.documentTypeList('recipe')),
                    S.listItem()
                      .title('Recipe Ingredients')
                      .schemaType('recipeIngredient')
                      .child(S.documentTypeList('recipeIngredient')),
                  ])
              ),
            
            // Fitness & Exercises
            S.listItem()
              .title('💪 Fitness')
              .child(
                S.list()
                  .title('Fitness Management')
                  .items([
                    S.listItem()
                      .title('Exercises')
                      .schemaType('exercise')
                      .child(S.documentTypeList('exercise')),
                    S.listItem()
                      .title('Workout Plans')
                      .schemaType('workoutPlan')
                      .child(S.documentTypeList('workoutPlan')),
                    S.listItem()
                      .title('Workout Exercises')
                      .schemaType('workoutExercise')
                      .child(S.documentTypeList('workoutExercise')),
                  ])
              ),
            
            // Habits & Tracking
            S.listItem()
              .title('🏃‍♂️ Habits & Tracking')
              .child(
                S.list()
                  .title('Habit Management')
                  .items([
                    S.listItem()
                      .title('Habits')
                      .schemaType('habit')
                      .child(S.documentTypeList('habit')),
                    S.listItem()
                      .title('Habit Completions')
                      .schemaType('habitCompletion')
                      .child(S.documentTypeList('habitCompletion')),
                  ])
              ),
            
            // Daily Tracking
            S.listItem()
              .title('📊 Daily Tracking')
              .child(
                S.list()
                  .title('Daily Records')
                  .items([
                    S.listItem()
                      .title('Daily Nutrition')
                      .schemaType('dailyNutrition')
                      .child(S.documentTypeList('dailyNutrition')),
                    S.listItem()
                      .title('Daily Body Metrics')
                      .schemaType('dailyBodyMetrics')
                      .child(S.documentTypeList('dailyBodyMetrics')),
                  ])
              ),
          ])
    }),
    visionTool(),
  ],
  
  schema: {
    types: schemaTypes,
  },
})
