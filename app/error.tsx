"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

// Boundary de error para toda la app — sin esto, cualquier excepción no
// capturada (ej. una sesión inválida por tener dos cuentas abiertas en el
// mismo navegador, o un error al llamar al OCR) deja la pantalla en negro
// sin ningún mensaje, en vez de esto.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-[420px] text-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h1 className="font-heading text-lg text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-sm text-gray-500 mb-5">
          Ocurrió un error inesperado. Si tienes otra cuenta abierta en este mismo
          navegador, cierra esa sesión primero — puede causar conflictos. Intenta
          de nuevo.
        </p>
        <div className="flex gap-2.5 justify-center">
          <Button onClick={() => reset()}>Reintentar</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/quotes")}>
            Ir a cotizaciones
          </Button>
        </div>
      </div>
    </div>
  );
}
