
'use client'

import { useState } from 'react'
import { Edit, Trash2, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Ingredient } from '@/lib/types/database'

interface IngredientsTableProps {
  ingredients: Ingredient[]
  onEdit: (ingredient: Ingredient) => void
  onDelete: (id: string) => void
  onManageUnits: (id: string) => void
}

export function IngredientsTable({ 
  ingredients, 
  onEdit, 
  onDelete, 
  onManageUnits 
}: IngredientsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="text-center">Protein (g/g)</TableHead>
            <TableHead className="text-center">Carbs (g/g)</TableHead>
            <TableHead className="text-center">Fats (g/g)</TableHead>
            <TableHead className="text-center">Calories (kcal/g)</TableHead>
            <TableHead className="text-center">Fiber (g/g)</TableHead>
            <TableHead className="text-center">Custom Units</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                No ingredients found. Click "Add Ingredient" to get started.
              </TableCell>
            </TableRow>
          ) : (
            ingredients.map((ingredient) => (
              <TableRow 
                key={ingredient.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(ingredient)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{ingredient.name || 'Unnamed Ingredient'}</span>
                    {ingredient.notes && (
                      <Badge variant="secondary" className="text-xs">
                        Notes
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {ingredient.protein?.toFixed(2) ?? '0.00'}
                </TableCell>
                <TableCell className="text-center">
                  {ingredient.carbs?.toFixed(2) ?? '0.00'}
                </TableCell>
                <TableCell className="text-center">
                  {ingredient.fats?.toFixed(2) ?? '0.00'}
                </TableCell>
                <TableCell className="text-center">
                  {ingredient.calories?.toFixed(2) ?? '0.00'}
                </TableCell>
                <TableCell className="text-center">
                  {ingredient.fiber?.toFixed(2) ?? '0.00'}
                </TableCell>
                <TableCell className="text-center">
                  {ingredient.customUnits?.length > 0 ? (
                    <Badge variant="outline" className="text-xs">
                      {ingredient.customUnits.length} units
                    </Badge>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(ingredient)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onManageUnits(ingredient.id)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(ingredient.id)
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
