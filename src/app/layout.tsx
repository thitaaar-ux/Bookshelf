import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Bunnarak — I'm your Bunnarak",
  description: "ระบบจัดการการอ่านและทลายกองดอง (I'm your Bunnarak) พร้อมระบบแจ้งเตือนและบันทึกหน้าอ่านผ่าน LINE Messaging API Webhook",
  openGraph: {
    title: "Bunnarak — I'm your Bunnarak",
    description: "ระบบจัดการการอ่านและทลายกองดอง (I'm your Bunnarak) พร้อมระบบแจ้งเตือนและบันทึกหน้าอ่านผ่าน LINE Messaging API Webhook",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body 
        className="bg-[#f8f7f4] text-[#121212] selection:bg-[#ff4d00] selection:text-white font-sans antialiased overflow-x-hidden min-h-screen"
        style={{ backgroundColor: '#f8f7f4', color: '#121212', minHeight: '100vh' }}
      >
        {children}
      </body>
    </html>
  );
}
