// pages/_app.tsx

// 1. Adım: Projenin global stillerini import et.
// Bu satır, TailwindCSS ve diğer tüm temel stillerin projenin
// her sayfasında aktif olmasını sağlar.
import '../styles/globals.css';

// 2. Adım: Next.js'in AppProps tipini import et.
// Bu, Component ve pageProps için doğru tipleri almamızı sağlar.
import type { AppProps } from 'next/app';

// 3. Adım: Ana Uygulama Bileşenini (MyApp) oluştur.
// Next.js, her sayfayı render etmeden önce bu bileşeni çağırır.
function MyApp({ Component, pageProps }: AppProps) {
  // Component: o anki sayfayı temsil eder (örn: index.tsx).
  // pageProps: o sayfanın alacağı başlangıç proplarıdır.
  return <Component {...pageProps} />;
}

// 4. Adım: Bileşeni varsayılan olarak export et.
export default MyApp;
