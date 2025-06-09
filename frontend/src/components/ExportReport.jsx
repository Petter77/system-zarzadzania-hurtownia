import { useState, useEffect } from "react";
import axios from "axios";
import { usePDF } from "react-to-pdf";

const ExportReport = ({ userToken, report, usernames, onClose }) => {
  const [reportItems, setReportItems] = useState([]);
  const [fileName, setFileName] = useState(`raport_${report?.id || ""}.pdf`);
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
          `http://localhost:3000/reports/getReportItems/${report.id}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        setReportItems(res.data.results);
      } catch (err) {
        alert("Błąd pobierania urządzeń z raportu.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportItems();
  }, [userToken, report.id]);

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
        <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Eksportuj raport do PDF</h2>
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
          onClick={() => toPDF()}
          disabled={loading || !fileName || reportItems.length === 0}
        >
          {loading ? "Ładowanie danych..." : "Eksportuj do PDF"}
        </button>

        {/* To, co zostanie wyeksportowane */}
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
          <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            Szczegóły raportu nr {report.id}
          </h2>
          <p><strong>Tytuł:</strong> {report.title}</p>
          <p><strong>Autor:</strong> {authorUsername}</p>
          <p><strong>Data:</strong> {new Date(report.created_at).toLocaleString()}</p>
          <hr style={{ margin: "12px 0" }} />
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
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Numer Seryjny</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Producent</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Model</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Status</th>
                <th style={{ border: "1px solid #d1d5db", padding: "4px" }}>Lokalizacja</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map(item => (
                <tr key={item.instance_id}>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{item.instance_id}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{item.serial_number}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{item.manufacturer}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{item.model}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{item.status}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "4px" }}>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportReport;
