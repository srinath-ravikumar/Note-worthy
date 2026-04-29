import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Note-Worthy — Personalized Medical Report Study',
  description: 'A research study on personalized medical document rewriting — CS568, University of Illinois Urbana-Champaign',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="font-bold text-slate-900">Note-Worthy</span>
          <span className="hidden sm:inline text-slate-400 text-sm">— Personalized Medical Document Study</span>
          <span className="ml-auto text-xs text-slate-400">CS568 · UIUC</span>
        </header>
        <main>{children}</main>
        <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-100 mt-12">
          CS568 User-Centered Machine Learning · University of Illinois Urbana-Champaign · 2025
        </footer>
      </body>
    </html>
  )
}
