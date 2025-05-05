// src/app/layout.js
import '/src/globals.css';

export const metadata = {
  title: 'THAI LOTTERY AGENT',
  description: '',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
