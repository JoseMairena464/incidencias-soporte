import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mesa de ayuda | Incidencias de soporte",
  description: "Registra y consulta incidencias de soporte técnico en un solo lugar.",
  openGraph: {
    title: "Mesa de ayuda | Incidencias de soporte",
    description: "Registro vivo de incidencias de soporte técnico.",
    type: "website",
    locale: "es_GT"
  }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><Providers>{children}</Providers></body></html>;
}