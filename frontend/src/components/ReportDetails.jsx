import { useState, useEffect } from "react";
import axios from "axios";

const ReportDetails = ({ userToken, report, usernames }) => {
  const [reportItems, setReportItems] = useState([]);
  
  if (!report) return null;
  const authorUsername = usernames[report.created_by] || "Nieznany";

  useEffect(() => {
    const fetchReportItems = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/reports/getReportItems/${report.id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setReportItems(res.data.results);
        //console.log("Pobrano report items: ", res);
      } catch (err) {
        console.log(err);
        //console.log("Błąd pobierania report items.");
      }
    };
    fetchReportItems();
  }, [userToken, report.id]);

  return (
    <div>
      {/* nagłówek */}
      <div>
        <h2 className="text-xl font-bold mb-2">Szczegóły raportu nr {report.id}</h2>
        <p><strong>Tytuł:</strong> {report.title}</p>
        <p><strong>Autor:</strong> {authorUsername}</p>
        <p><strong>Data:</strong> {new Date(report.created_at).toLocaleString()}</p>
        <hr className="border-t-2 border-gray-400 my-4" />  
      </div>
      {/* lista */}
      <div>
        <table className="w-full table-auto border-collapse border border-gray-300 mb-6">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left text-gray-700">ID</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Numer Seryjny</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Producent</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Model</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Status</th>
              <th className="px-4 py-2 border-b text-left text-gray-700">Lokalizacja</th>
            </tr>
          </thead>
          <tbody>
            {reportItems.map(({ instance_id, location, manufacturer, model, serial_number, status }) => (
              <tr key={instance_id}>
                <td className="px-4 py-2 border-b">{instance_id}</td>
                <td className="px-4 py-2 border-b">{serial_number}</td>
                <td className="px-4 py-2 border-b">{manufacturer}</td>
                <td className="px-4 py-2 border-b">{model}</td>
                <td className="px-4 py-2 border-b">{status}</td>
                <td className="px-4 py-2 border-b">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>     
    </div>
  );
};

export default ReportDetails;
