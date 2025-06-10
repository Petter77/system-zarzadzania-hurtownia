import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import ReportDetails from "./ReportDetailsInOut";
import ExportInOutReport from "./ExportReportInOut";

const ViewReport = ({ userToken }) => {
  const [reports, setReports] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReportDetailsOpen, setIsReportDetailsOpen] = useState(false);
  const [isReportExportOpen, setIsReportExportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const decoded = jwtDecode(userToken);
  //console.log("decoded token:", decoded);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/reports/getReportsInOut", {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
        const reportsData = res.data.results || [];
        setReports(reportsData);
        //console.log("Pobrane raporty:", res.data.results);

        // Pobierz unikalne userId
        const uniqueUserIds = [...new Set(reportsData.map(r => r.created_by))];

        // Pobierz username dla każdego userId
        const usernameMap = {};
        await Promise.all(uniqueUserIds.map(async (userId) => {
          try {
            const userRes = await axios.get(
              `http://localhost:3000/reports/userDetails/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            usernameMap[userId] = userRes.data.user?.username || "Nieznany";
          } catch {
            usernameMap[userId] = "Nieznany";
          }
        }));

        setUsernames(usernameMap);
        //console.log("Pobrane usernames:", usernameMap);
      } catch {
        setReports([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [userToken]);

  

  if (loading) return <div>Ładowanie raportów...</div>;
  if (!reports.length) return <div>Brak dostępnych raportów</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Dostępne raporty: operacje in/out</h2>
      {!reports ? (
        <p className="text-center text-gray-500">Brak dostępnych raportów</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300 mb-6">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left text-gray-700">ID</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Nazwa</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Autor</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Data</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(({ id, title, created_by, created_at }) => (
              <tr key={id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">{id}</td>
                <td className="px-4 py-2 border-b">{title}</td>
                <td className="px-4 py-2 border-b">{usernames[created_by] || "Ładowanie..."}</td>
                <td className="px-4 py-2 border-b">{new Date(created_at).toLocaleDateString()} {new Date(created_at).toLocaleTimeString()}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                    onClick={() => {
                      setSelectedReport({ id, title, created_by, created_at});
                      setIsReportDetailsOpen(true);
                    }}
                  >
                    Szczegóły
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                    onClick={() => {
                      setSelectedReport({ id, title, created_by, created_at});
                      setIsReportExportOpen(true);
                    }}
                  >
                    Eksportuj
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(isReportDetailsOpen) && (
        <div
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
        onClick={() => {
          setIsReportDetailsOpen(false);
          setSelectedReport(null);
        }}
      >
        <div
          className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 text-gray-500 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
            onClick={() => {
              setIsReportDetailsOpen(false);
              setSelectedReport(null);
            }}
          >
            Zamknij
          </button>
          <div>
            <ReportDetails 
              userToken={userToken} 
              report={selectedReport} 
              usernames={usernames} 
            />
          </div>
        </div>
      </div>
      )}
      {isReportExportOpen && (
        <ExportInOutReport
          userToken={userToken}
          report={selectedReport}
          usernames={usernames}
          onClose={() => {
            setIsReportExportOpen(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};

export default ViewReport;
