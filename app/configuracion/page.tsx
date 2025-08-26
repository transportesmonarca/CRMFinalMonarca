import { Suspense } from "react";
import ConfiguracionClient from "./ConfiguracionClient";

export const dynamic = "force-dynamic";  // evita SSG del árbol
export const revalidate = 0;             // sin caché de rutas

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Cargando configuración…</div>}>
      <ConfiguracionClient />
    </Suspense>
  );
}