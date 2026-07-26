import type { Metadata, Viewport } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// next/font: descarga y autohospeda las fuentes en el build (sin request
// externa a Google Fonts en tiempo de ejecución) e inyecta solo los recortes
// de caracteres usados — clave para un primer pintado rápido en redes lentas
// y celulares viejos.
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Academia Aventura 🏰",
  description:
    "La escuela hecha juego: matemáticas, inglés, lengua, ciencias, finanzas y programación. Crea tu héroe, gana recompensas y conviértete en leyenda.",
};

// evita el zoom accidental al tocar botones/inputs en móvil
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0c0c20",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${baloo.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
