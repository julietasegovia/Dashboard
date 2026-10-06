export const viewport: Viewport = {
    colorScheme: 'light dark',
    themeColor: [
        {media: '(prefers-color-scheme: light)', color:'white'},
        {media: '(prefers-color-scheme: dark)', color:'black'},
    ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-[#edf5ff] font-sans text-[#173b63] antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}