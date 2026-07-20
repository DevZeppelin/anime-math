import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academia Aventura 🏰",
  description:
    "La escuela hecha juego: matemáticas, inglés, lengua, ciencias, finanzas y programación. Crea tu héroe, gana recompensas y conviértete en leyenda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
