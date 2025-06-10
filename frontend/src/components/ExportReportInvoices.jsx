import { useState, useEffect } from "react";
import axios from "axios";
import { usePDF } from "react-to-pdf";

const ExportInvoicesReport = ({ userToken, report, usernames, onClose }) => {
  const [reportItems, setReportItems] = useState([]);
  const [fileName, setFileName] = useState(`raport_faktury_${report?.id || ""}.pdf`);
  const [loading, setLoading] = useState(true);

  const { toPDF, targetRef } = usePDF({
    filename: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
    page: { margin: 10 },
    resolution: 4,
  });

  const authorUsername = usernames[report.created_by] || "Nieznany";

  useEffect(() => {
    const fetchReportItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3000/reports/getReportInvoices/${report.id}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        setReportItems(res.data.results);
      } catch (err) {
        alert("Błąd pobierania faktur z raportu.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportItems();
  }, [userToken, report.id]);

  const handleExport = async () => {
    try {
      // Log the download
      await axios.post(
        'http://localhost:3000/reports/logReportDownload',
        {
          reportId: report.id,
          reportType: 'invoices',
          fileName: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
        },
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      toPDF();
    } catch (err) {
      console.error('Error logging download:', err);
      toPDF();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 50 }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
          maxWidth: 600,
          width: "100%",
          position: "relative",
          maxHeight: "65vh",
          overflow: "auto"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer"
          }}
          onClick={onClose}
        >
          Zamknij
        </button>
        <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Eksportuj raport faktur do PDF</h2>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Nazwa pliku PDF:
          <input
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              padding: 8,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 16
            }}
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            disabled={loading}
          />
        </label>
        <button
          style={{
            marginTop: 16,
            width: "100%",
            padding: "10px 0",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            fontSize: 16,
            cursor: loading || !fileName || reportItems.length === 0 ? "not-allowed" : "pointer",
            opacity: loading || !fileName || reportItems.length === 0 ? 0.6 : 1
          }}
          onClick={handleExport}
          disabled={loading || !fileName || reportItems.length === 0}
        >
          {loading ? "Ładowanie danych..." : "Eksportuj do PDF"}
        </button>

        {}
        <div
          ref={targetRef}
          style={{
            width: "100%",
            minWidth: 300,
            backgroundColor: "#fff",
            color: "#111",
            borderRadius: 8,
            marginTop: 32,
            padding: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
          }}
        >
          {}
          <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            Szczegóły raportu nr {report.id}
          </h2>
          <p><strong>Tytuł:</strong> {report.title}</p>
          <p><strong>Autor:</strong> {authorUsername}</p>
          <p><strong>Data:</strong> {new Date(report.created_at).toLocaleString()}</p>
          <hr style={{ margin: "12px 0" }} />
          {/* Lista faktur */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              color: "#111",
              fontSize: 12
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>ID</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Numer faktury</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Wydana przez</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Data wydania</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map(({ id, number, issued_by, issued_at, username }) => (
                <tr key={id}>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{id}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{number}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{username}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{new Date(issued_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportInvoicesReport;
