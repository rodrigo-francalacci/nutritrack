
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/navigation'

export const metadata: Metadata = {
  title: 'NutriTrack - Fitness & Nutrition Tracking',
  description: 'Comprehensive nutritional and fitness tracking application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="win98-body">
        <div className="win98-app-container">
          <Navigation />
          <main className="win98-main-content">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
