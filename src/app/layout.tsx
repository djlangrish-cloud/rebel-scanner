import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rebel AI Scanner',
  description: 'Analyse any website for AI search visibility. Get scored on Findability, Quotability, Understandability, and Trustworthiness.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-rebel-black text-rebel-white font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
