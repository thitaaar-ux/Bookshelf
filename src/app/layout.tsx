import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TSUNDOKU',
  description: 'ระบบจัดการการอ่านและทลายกองดอง (Tsundoku Killer) พร้อมระบบแจ้งเตือนและบันทึกหน้าอ่านผ่าน LINE Messaging API Webhook',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white font-sans antialiased overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
