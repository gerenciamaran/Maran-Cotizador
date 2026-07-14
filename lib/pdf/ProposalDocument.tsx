import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Quote } from "@/lib/supabase/types";

// react-pdf tiene su propio pipeline de fuentes (no usa next/font), así que
// hay que registrar los mismos tipos de letra de la marca apuntando a sus
// archivos .ttf reales.
Font.register({
  family: "Oswald",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/oswald@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/oswald@latest/latin-600-normal.ttf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/oswald@latest/latin-700-normal.ttf", fontWeight: 700 },
  ],
});
Font.register({
  family: "IBM Plex Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@latest/latin-600-normal.ttf", fontWeight: 600 },
  ],
});
Font.register({
  family: "IBM Plex Mono",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-400-normal.ttf", fontWeight: 400 },
  ],
});

const COLORS = {
  navy: "#0b3d66",
  navyDark: "#082a48",
  gold: "#e3b505",
  ink: "#12202b",
  inkSoft: "#4a5a66",
  border: "#e2e5e9",
  bg: "#f5f6f8",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "IBM Plex Sans",
    fontSize: 10,
    color: COLORS.ink,
    padding: 0,
  },
  coverPage: {
    fontFamily: "IBM Plex Sans",
    backgroundColor: COLORS.navy,
    color: "white",
    padding: 48,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: { width: 90, height: 65 },
  coverTitle: {
    fontFamily: "Oswald",
    fontWeight: 700,
    fontSize: 30,
    marginTop: 24,
  },
  coverSubtitle: {
    fontFamily: "Oswald",
    fontWeight: 400,
    fontSize: 16,
    color: COLORS.gold,
    marginBottom: 16,
  },
  coverMeta: { fontSize: 10, color: "#c7d6e5", marginTop: 6 },
  coverFooter: { fontSize: 9, color: "#8fa8bd" },

  section: { padding: 36 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLogo: { width: 62, height: 45 },
  headerTitle: { fontFamily: "Oswald", fontSize: 14, color: COLORS.navy, fontWeight: 600 },

  sectionTitle: {
    fontFamily: "Oswald",
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.navy,
    marginBottom: 10,
    marginTop: 18,
  },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 6,
    padding: 10,
  },
  statLabel: { fontSize: 8, color: COLORS.inkSoft, fontFamily: "IBM Plex Mono" },
  statValue: { fontFamily: "Oswald", fontSize: 16, color: COLORS.ink, marginTop: 2 },

  table: { marginTop: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navy,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  th: { fontSize: 8, fontFamily: "IBM Plex Mono", color: COLORS.inkSoft, textTransform: "uppercase" },
  td: { fontSize: 10 },
  colName: { flex: 3 },
  colCat: { flex: 2 },
  colVal: { flex: 2, textAlign: "right" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.navy,
  },
  totalLabel: { fontFamily: "Oswald", fontSize: 14, color: COLORS.ink },
  totalValue: { fontFamily: "Oswald", fontSize: 18, color: COLORS.navy, fontWeight: 700 },

  termsText: { fontSize: 10, lineHeight: 1.6, color: COLORS.ink, marginBottom: 10 },
  termsTitle: { fontFamily: "Oswald", fontSize: 11, color: COLORS.navy, fontWeight: 600, marginTop: 12, marginBottom: 4 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 8,
    color: COLORS.inkSoft,
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
});

function formatCop(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

const CATEGORY_LABELS: Record<string, string> = {
  panel: "Paneles",
  inverter: "Inversor",
  structure: "Estructura",
  labor: "Mano de obra",
  other: "Otros",
};

export function ProposalDocument({
  quote,
  logoSrc,
  quoteNumber,
}: {
  quote: Quote;
  logoSrc: string;
  quoteNumber: string;
}) {
  const date = new Date(quote.created_at).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      {/* Portada */}
      <Page size="A4" style={styles.coverPage}>
        <Image src={logoSrc} style={styles.logo} />
        <View>
          <Text style={styles.coverSubtitle}>PROPUESTA COMERCIAL</Text>
          <Text style={styles.coverTitle}>Sistema Solar Fotovoltaico</Text>
          <Text style={styles.coverMeta}>
            {quote.client_company_name ?? "Cliente"}
          </Text>
          {quote.client_nit && <Text style={styles.coverMeta}>NIT: {quote.client_nit}</Text>}
          {quote.address && <Text style={styles.coverMeta}>{quote.address}</Text>}
          <Text style={styles.coverMeta}>Cotización N.° {quoteNumber}</Text>
          <Text style={styles.coverMeta}>{date}</Text>
        </View>
        <Text style={styles.coverFooter}>
          © {new Date().getFullYear()} Marán Energy. Todos los derechos reservados.
        </Text>
      </Page>

      {/* Resumen técnico */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.header}>
            <Image src={logoSrc} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>Resumen técnico</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>CONSUMO MENSUAL</Text>
              <Text style={styles.statValue}>{quote.monthly_consumption_kwh} kWh</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TARIFA</Text>
              <Text style={styles.statValue}>{formatCop(quote.tariff_cop_per_kwh)}/kWh</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>IRRADIACIÓN PROMEDIO DEL SITIO</Text>
              <Text style={styles.statValue}>
                {quote.avg_daily_irradiation?.toFixed(2)} kWh/m²/día
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TAMAÑO DEL SISTEMA</Text>
              <Text style={styles.statValue}>{quote.required_kwp?.toFixed(2)} kWp</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Producción y ahorro estimado</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>PRODUCCIÓN MENSUAL ESTIMADA</Text>
              <Text style={styles.statValue}>
                {quote.estimated_monthly_production_kwh?.toFixed(0)} kWh
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>AHORRO MENSUAL ESTIMADO</Text>
              <Text style={styles.statValue}>{formatCop(quote.estimated_monthly_savings_cop)}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RETORNO DE INVERSIÓN ESTIMADO</Text>
              <Text style={styles.statValue}>
                {quote.payback_years ? `${quote.payback_years.toFixed(1)} años` : "—"}
              </Text>
            </View>
            <View style={styles.statBox} />
          </View>
        </View>
        <Text style={styles.footer} fixed>
          Marán Energy · Propuesta comercial · Cotización N.° {quoteNumber}
        </Text>
      </Page>

      {/* Presupuesto */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.header}>
            <Image src={logoSrc} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>Presupuesto</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, styles.colName]}>Ítem</Text>
              <Text style={[styles.th, styles.colCat]}>Categoría</Text>
              <Text style={[styles.th, styles.colVal]}>Valor</Text>
            </View>
            {(quote.budget_breakdown ?? []).map((line, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, styles.colName]}>{line.name}</Text>
                <Text style={[styles.td, styles.colCat]}>
                  {CATEGORY_LABELS[line.category] ?? line.category}
                </Text>
                <Text style={[styles.td, styles.colVal]}>{formatCop(line.subtotal_cop)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCop(quote.total_budget_cop)}</Text>
          </View>
        </View>
        <Text style={styles.footer} fixed>
          Marán Energy · Propuesta comercial · Cotización N.° {quoteNumber}
        </Text>
      </Page>

      {/* Términos y condiciones */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.header}>
            <Image src={logoSrc} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>Términos y condiciones</Text>
          </View>

          <Text style={styles.termsTitle}>Vigencia de la oferta</Text>
          <Text style={styles.termsText}>
            Esta propuesta tiene una vigencia de 15 días calendario a partir de la fecha de
            emisión. Pasado este período, los precios y condiciones aquí presentados pueden
            variar y deberán ser confirmados nuevamente con Marán Energy.
          </Text>

          <Text style={styles.termsTitle}>Forma de pago</Text>
          <Text style={styles.termsText}>
            Las condiciones de pago (anticipo, pagos parciales y saldo final) se definen y
            formalizan en el contrato de prestación de servicios, previa aceptación de esta
            propuesta.
          </Text>

          <Text style={styles.termsTitle}>Garantía</Text>
          <Text style={styles.termsText}>
            Los equipos incluidos cuentan con la garantía del fabricante correspondiente. La
            instalación realizada por Marán Energy cuenta con garantía de obra según lo
            estipulado en el contrato.
          </Text>

          <Text style={styles.termsTitle}>Alcance</Text>
          <Text style={styles.termsText}>
            El presupuesto incluido en esta propuesta corresponde al dimensionamiento técnico
            estimado a partir de la información de consumo suministrada y datos públicos de
            irradiación solar para la ubicación indicada. El dimensionamiento final podrá
            ajustarse tras una visita técnica al sitio.
          </Text>
        </View>
        <Text style={styles.footer} fixed>
          Marán Energy · Propuesta comercial · Cotización N.° {quoteNumber}
        </Text>
      </Page>
    </Document>
  );
}
