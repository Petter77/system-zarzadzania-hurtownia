import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import Select from "react-select";

const CreateReport = ({ userToken }) => {
  const [reportName, setReportName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [message, setMessage] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [performedBy, setPerformedBy] = useState([]);
  const [types, setTypes] = useState([]);


  const decoded = jwtDecode(userToken);
  //console.log("decoded token:", decoded);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/reports/getAllUsers", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setUsersData(res.data.results);
        //console.log("Pobrani użytkownicy: ", res);
      } catch (err) {
        console.log(err);
        //console.log("Błąd pobierania danych do formularza.");
      }
    };
    fetchUsers();
  }, [userToken]);

  const usersList = usersData
  ? usersData.map(user => ({ value: user.id, label: user.username }))
  : [];

  const typesList = [
    { value: "toService", label: "Do serwisu" },
    { value: "fromService", label: "Z serwisu" },
    { value: "borrow", label: "Pożyczenie" },
    { value: "return", label: "Zwrócenie" },
  ];

  const handleSubmit = (e) => {
    setMessage("Tworzenie raportu...");
    e.preventDefault();
    
    const formData = {
      reportName,
      startDate,
      finishDate,
      performedBy: performedBy.map(option => option.value),
      types: types.map(option => option.value),
    };
    console.log("Wysłane dane:", formData);

    const createReport = async () => {
      try {
        await axios.post("http://localhost:3000/reports/createReportInOut", formData, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Raport został utworzony.");
      } catch (err) {
        console.log(err);
        if (err.response && err.response.status === 409) {
          setMessage(err.response.data.error); // wyświetli "Raport o takiej nazwie już istnieje!"
        } else {
          setMessage("Błąd podczas tworzenia raportu.");
        }
      }
    };
    createReport();
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Utwórz raport: operacje in/out</h2>
      <form className="max-w-xl p-6 bg-white shadow-lg rounded-lg" onSubmit={handleSubmit}>
        {message && <p className="text-red-500 text-center font-semibold mb-4">{message}</p>}
        <div className="mb-4">
          <label htmlFor="reportName" className="block text-gray-700 mb-2">Nazwa raportu:</label>
          <input
            required
            type="text"
            name="reportName"
            id="reportName"
            value={reportName}
            onChange={e => setReportName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <p className="block text-gray-700 mb-2 mx-auto text-center font-semibold">Filtry</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label htmlFor="reportPerformedBy" className="block text-gray-700 mb-2">Wykonane przez:</label>
            <Select
              isMulti
              options={usersList}
              value={performedBy}
              onChange={setPerformedBy}
              placeholder="wybierz..."
              className="basic-multi-select"
              classNamePrefix="select"
              //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reportTypes" className="block text-gray-700 mb-2">Typy:</label>
            <Select
              isMulti
              options={typesList}
              value={types}
              onChange={setTypes}
              placeholder="wybierz..."
              className="basic-multi-select"
              classNamePrefix="select"
              //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="startDate" className="block text-gray-700 mb-2">Data początkowa:</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              max={new Date().toISOString().split('T')[0] ? finishDate : undefined}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="finishDate" className="block text-gray-700 mb-2">Data  końcowa:</label>
            <input
              type="date"
              name="finishDate"
              id="finishDate"
              min={startDate ? startDate : undefined}
              max={new Date().toISOString().split('T')[0]}
              value={finishDate}
              onChange={e => setFinishDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>        

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
        >
          Utwórz
        </button>
      </form>
    </div>
  );
};

export default CreateReport;
