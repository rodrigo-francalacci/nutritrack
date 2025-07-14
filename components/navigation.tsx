
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Utensils, 
  ChefHat, 
  Dumbbell, 
  CheckSquare, 
  TrendingUp 
} from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Ingredients', href: '/ingredients', icon: Utensils },
    { name: 'Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Exercises', href: '/exercises', icon: Dumbbell },
    { name: 'Habits', href: '/habits', icon: CheckSquare },
    { name: 'Daily Tracking', href: '/daily-tracking', icon: TrendingUp },
  ]

  return (
    <nav className="win98-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`win98-nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <Icon className="w-3 h-3" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
