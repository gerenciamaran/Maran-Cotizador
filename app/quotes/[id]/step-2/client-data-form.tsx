"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { updateClientDataAction, type ActionState } from "@/lib/actions/quotes";
import { Button, FieldLabel, inputClass } from "@/components/ui";
import type { Quote } from "@/lib/supabase/types";

// Leaflet toca `window` al importarse, así que el mapa debe cargarse solo en
// el navegador (nunca durante el render en el servidor).
const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-72 rounded-xl bg-gray-100 animate-pulse" /> }
);

const initialState: ActionState = { error: null };

export function ClientDataForm({ quote }: { quote: Quote }) {
  const [state, formAction, pending] = useActionState(updateClientDataAction, initialState);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    quote.latitude && quote.longitude ? { lat: quote.latitude, lng: quote.longitude } : null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="quote_id" value={quote.id} />
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />

      <FieldLabel>Empresa / cliente</FieldLabel>
      <input
        name="client_company_name"
        defaultValue={quote.client_company_name ?? ""}
        className={inputClass}
        placeholder="Ej: Comercializadora ABC S.A.S."
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>NIT</FieldLabel>
          <input
            name="client_nit"
            defaultValue={quote.client_nit ?? ""}
            className={inputClass}
            placeholder="900.123.456-7"
          />
        </div>
        <div>
          <FieldLabel>Contacto</FieldLabel>
          <input
            name="client_contact_name"
            defaultValue={quote.client_contact_name ?? ""}
            className={inputClass}
            placeholder="Nombre del contacto"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Correo de contacto</FieldLabel>
          <input
            type="email"
            name="client_contact_email"
            defaultValue={quote.client_contact_email ?? ""}
            className={inputClass}
            placeholder="correo@cliente.com"
          />
        </div>
        <div>
          <FieldLabel>Teléfono</FieldLabel>
          <input
            name="client_contact_phone"
            defaultValue={quote.client_contact_phone ?? ""}
            className={inputClass}
            placeholder="300 000 0000"
          />
        </div>
      </div>

      <FieldLabel>Dirección</FieldLabel>
      <input
        name="address"
        defaultValue={quote.address ?? ""}
        className={inputClass}
        placeholder="Dirección del sitio"
      />

      <FieldLabel>Ubicación del sitio (para calcular la irradiación solar)</FieldLabel>
      <LocationPicker
        initialLat={quote.latitude}
        initialLng={quote.longitude}
        onChange={(lat, lng) => setCoords({ lat, lng })}
      />

      {state.error && <p className="text-danger text-sm mt-2">{state.error}</p>}

      <div className="mt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Siguiente →"}
        </Button>
      </div>
    </form>
  );
}
