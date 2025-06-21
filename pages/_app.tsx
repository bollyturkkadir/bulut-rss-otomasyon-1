import '../styles/globals.css';
import type { AppProps } from 'next/app';

// AuthProvider import'u ve kullanımı tamamen kaldırıldı.

function MyApp({ Component, pageProps }: AppProps) {
  // Artık AuthProvider ile sarmalama yapmıyoruz.
  return <Component {...pageProps} />;
}

export default MyApp;
