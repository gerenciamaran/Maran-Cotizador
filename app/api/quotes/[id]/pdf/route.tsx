import { readFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ProposalDocument } from "@/lib/pdf/ProposalDocument";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireProfile();
  const { id } = await params;

  const supabase = await createClient();
  const { data: quote, error } = await supabase.from("quotes").select("*").eq("id", id).single();

  if (error || !quote) {
    return NextResponse.json({ error: "Cotización no encontrada." }, { status: 404 });
  }
  if (!quote.total_budget_cop || !quote.budget_breakdown) {
    return NextResponse.json(
      { error: "Falta calcular el presupuesto antes de generar el PDF." },
      { status: 400 }
    );
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoBuffer = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const quoteNumber = quote.id.slice(0, 8).toUpperCase();

  const pdfBuffer = await renderToBuffer(
    <ProposalDocument quote={quote} logoSrc={logoSrc} quoteNumber={quoteNumber} />
  );

  const storagePath = `${quote.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("proposal-pdfs")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (!uploadError) {
    await supabase
      .from("quotes")
      .update({ pdf_storage_path: storagePath, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      // "inline" en vez de "attachment": se abre en el visor de PDF del
      // navegador (con su propio botón de descarga/imprimir) en vez de
      // forzar la descarga inmediata.
      "Content-Disposition": `inline; filename="propuesta-${quoteNumber}.pdf"`,
    },
  });
}
