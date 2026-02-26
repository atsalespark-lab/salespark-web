import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TheSalesPark — Built for the person carrying the number',
  description: 'No login to browse. No manager watching. Just salespeople being honest.',
  openGraph: {
    title: 'TheSalesPark',
    description: 'The park where sales breathes freely.',
    url: 'https://thesalespark.com',
    siteName: 'TheSalesPark',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="day" data-accent="orange" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var mode = localStorage.getItem('sp-mode') || 'day';
                var accent = localStorage.getItem('sp-accent') || 'orange';
                var legacy = { ember:'orange', forest:'green', cobalt:'blue', wine:'orange' };
                if (legacy[accent]) accent = legacy[accent];
                document.documentElement.setAttribute('data-mode', mode);
                document.documentElement.setAttribute('data-accent', accent);
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
