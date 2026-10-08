export const viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}
 
export default function RootLayout({ children }) {
  // #region agent log
  fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'F',location:'layout.jsx:RootLayout',message:'layout render',data:{rootTag:'html'},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <html lang="en">
      <body className="bg-[#edf5ff] font-sans text-[#173b63] antialiased">
        {children}
      </body>
    </html>
  )
}