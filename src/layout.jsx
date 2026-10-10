
export const viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#edf5ff] font-sans text-[#173b63] antialiased">
      {children}
    </div>
  )
}