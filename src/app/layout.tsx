import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rebel AI Scanner',
  description: 'Analyse any website for AI search visibility. Get scored on Findability, Quotability, Understandability, and Trustworthiness.',
  icons: {
    icon: 'https://rebelmarketer.co.uk/wp-content/uploads/2025/09/R.png',
    apple: 'https://rebelmarketer.co.uk/wp-content/uploads/2025/09/R.png',
  },
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
