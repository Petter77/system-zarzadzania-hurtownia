import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Style PDF-a
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  title: { fontSize: 20, marginBottom: 10, textAlign: "center" },
  bold: { fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  tableHeader: { backgroundColor: "#eee", padding: 5 },
  tableRow: { flexDirection: "row", padding: 5, borderBottom: "1 solid #ccc" },
  cell: { flex: 1 },
});

export const InvoicePDFDocument = ({ invoice }) => {
  const total = invoice.products.reduce((sum, p) => sum + Number(p.price || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Faktura VAT</Text>

        <View style={styles.section}>
          <Text>Numer: {invoice.number}</Text>
          <Text>Data wystawienia: {new Date(invoice.issued_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Sprzedawca:</Text>
          <Text>Sieciowi</Text>
          <Text>Marsjanska √-1a</Text>
          <Text>NIP: 0000000000</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Nabywca:</Text>
          <Text>{invoice.recipient_name}</Text>
          <Text>{invoice.recipient_address}</Text>
          <Text>{invoice.recipient_nip}</Text>
        </View>

        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.bold}>Produkty:</Text>
          <View style={styles.tableHeader}>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.bold]}>Lp</Text>
              <Text style={[styles.cell, styles.bold]}>Nazwa</Text>
              <Text style={[styles.cell, styles.bold]}>Cena netto (zl)</Text>
            </View>
          </View>
          {invoice.products.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cell}>{i + 1}</Text>
              <Text style={styles.cell}>{p.description}</Text>
              <Text style={styles.cell}>{Number(p.price).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 10, alignItems: "flex-end" }}>
          <Text style={[styles.bold]}>Do zaplaty: {total.toFixed(2)} zł</Text>
        </View>
      </Page>
    </Document>
  );
};
