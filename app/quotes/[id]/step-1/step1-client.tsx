"use client";

import { useState } from "react";
import { OcrUpload } from "@/app/quotes/[id]/step-1/ocr-upload";
import { ConsumptionForm } from "@/app/quotes/[id]/step-1/consumption-form";

export function Step1Client({
  quoteId,
  initialConsumption,
  initialTariff,
}: {
  quoteId: string;
  initialConsumption: number | null;
  initialTariff: number | null;
}) {
  const [consumption, setConsumption] = useState(initialConsumption);
  const [tariff, setTariff] = useState(initialTariff);

  return (
    <>
      <OcrUpload
        quoteId={quoteId}
        onExtracted={(c, t) => {
          if (c) setConsumption(c);
          if (t) setTariff(t);
        }}
      />
      <ConsumptionForm
        key={`${consumption}-${tariff}`}
        quoteId={quoteId}
        initialConsumption={consumption}
        initialTariff={tariff}
      />
    </>
  );
}
