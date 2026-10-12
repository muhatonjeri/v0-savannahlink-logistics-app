import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: {
    default: 'Moventra Safaris & Logistics Ltd - Logistics & Tours',
    template: '%s | Moventra Safaris & Logistics Ltd'
  },
  description: 'Your trusted partner for logistics, transportation, and tour services across Kenya. Car rental, safari tours, movers, cargo handling, and more.',
  keywords: ['logistics', 'tours', 'car rental', 'safari', 'Kenya', 'Nairobi', 'transportation', 'movers', 'cargo'],
  authors: [{ name: 'Moventra Safaris & Logistics Ltd' }],
  creator: 'Moventra Safaris & Logistics Ltd',
  icons: {
    // Browser-tab icons, generated from the Moventra badge (/images/logo.png).
    // The old icon.svg entry was removed: browsers prefer SVG and would keep showing the old icon.
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('SW registered:', registration.scope);
              }).catch(function(err) {
                console.log('SW failed:', err);
              });
            });
          }
        ` }} />
      </body>
    </html>
  )
}
