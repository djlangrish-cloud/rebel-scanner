import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Rebel AI Scanner',
    template: '%s — Rebel AI Scanner',
  },
  description: 'Free AI search readiness audit. Find out how AI search engines read your website.',
  icons: {
    icon: 'https://rebelmarketer.co.uk/wp-content/uploads/2025/09/R.png',
    apple: 'https://rebelmarketer.co.uk/wp-content/uploads/2025/09/R.png',
  },
  verification: {
    google: 'jEHJN_ohekqscWRrtV9P_cGOmHZg4q5zy7lSgkTdut4',
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
