import React from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "./InvoicePDFDocument"; // dopasuj ścieżkę

const downloadPdfInvoice = async (invoice) => {
  const blob = await pdf(<InvoicePDFDocument invoice={invoice} />).toBlob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `faktura-${invoice.number}.pdf`;
  a.click();

  URL.revokeObjectURL(url);
};

// Funkcja do generowania i pobierania pliku .txt
const downloadTxtInvoice = (invoice) => {
  const lines = [];

  lines.push(`Faktura nr: ${invoice.number}`);
  lines.push(`Data wystawienia: ${new Date(invoice.issued_at).toLocaleDateString()}`);
  lines.push("");
  lines.push("Sprzedawca:");
  lines.push("Sieciowi");
  lines.push("Marsjańska √-1a");
  lines.push("NIP: 0000000000");
  lines.push("");
  lines.push("Nabywca:");
  lines.push(`${invoice.recipient_name}`);
  lines.push(`${invoice.recipient_address}`);
  lines.push(`${invoice.recipient_nip}`);
  lines.push("");
  lines.push("Produkty:");

  invoice.products.forEach((p, index) => {
    lines.push(`${index + 1}. ${p.description} - ${Number(p.price).toFixed(2)} zł`);
  });

  const total = invoice.products.reduce((sum, p) => sum + Number(p.price || 0), 0);
  lines.push("");
  lines.push(`Do zapłaty: ${total.toFixed(2)} zł`);

  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `faktura-${invoice.number}.txt`;
  a.click();

  URL.revokeObjectURL(url); // zwolnienie zasobów
};

const InvoicePreview = ({ invoice, onClose }) => {
  const totalPrice = invoice.products.reduce((sum, p) => sum + Number(p.price || 0), 0);

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex justify-center items-center z-50 p-8">
      <div className="bg-white border border-gray-300 shadow-lg p-10 rounded-md w-[960px] relative flex flex-col min-h-[900px]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-600 font-bold hover:text-red-800"
        >
          Zamknij
        </button>

        <div className="flex justify-between items-start mb-10">
          <div className="text-3xl font-bold text-blue-700">LOGO</div>
          <div className="text-right">
            <p className="font-semibold text-xl">{invoice.number}</p>
            <p className="text-sm text-gray-700 mt-2">
              {new Date(invoice.issued_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h4 className="font-semibold mb-2">Sprzedawca</h4>
            <p className="text-gray-600 text-sm">Sieciowi</p>
            <p className="text-gray-600 text-sm">Marsjańska √-1a</p>
            <p className="text-gray-600 text-sm">NIP: 0000000000</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Nabywca</h4>
            <p className="text-sm text-gray-700">{invoice.recipient_name}</p>
            <p className="text-sm text-gray-700">{invoice.recipient_address}</p>
            <p className="text-sm text-gray-700">{invoice.recipient_nip}</p>
          </div>
        </div>

        <table className="w-full text-sm text-left text-gray-700 mb-8 border-t border-b border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4">Lp</th>
              <th className="py-3 px-4">Nazwa</th>
              <th className="py-3 px-4">Cena netto (zł)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.map((product, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{product.description}</td>
                <td className="py-2 px-4">{Number(product.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-lg font-semibold text-right">
          Do zapłaty:{" "}
          <span className="text-green-600">{totalPrice.toFixed(2)} zł</span>
        </p>

        <button
          onClick={() => downloadTxtInvoice(invoice)}
          className="mt-6 self-end bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Pobierz jako TXT
        </button>
        <button
          onClick={() => downloadPdfInvoice(invoice)}
          className="mt-2 self-end bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Pobierz jako PDF
        </button>
        
      </div>
    </div>
  );
};

export default InvoicePreview;
