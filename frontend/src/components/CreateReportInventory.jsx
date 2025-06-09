import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import Select from "react-select";

const CreateReport = ({ userToken }) => {
  const [reportName, setReportName] = useState("");
  const [producers, setProducers] = useState([]);
  const [models, setModels] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [localizations, setLocalizations] = useState([]);
  const [message, setMessage] = useState(null);
  const [createData, setCreateData] = useState({
    manufacturers: [],
    models: [],
    locations: []
  });

  const decoded = jwtDecode(userToken);
  //console.log("decoded token:", decoded);

  useEffect(() => {
    const fetchCreateData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/reports/getDataForCreate", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setCreateData(res.data);
        //console.log("Pobrano dane do formularza: ", res);
      } catch (err) {
        console.log(err);
        //console.log("Błąd pobierania danych do formularza.");
      }
    };
    fetchCreateData();
  }, [userToken]);

  const producerOptions = createData.manufacturers
    ? createData.manufacturers.map(m => ({ value: m, label: m }))
    : [];

  const modelOptions = createData.models
    ? createData.models.map(m => ({ value: m, label: m }))
    : [];

  const localizationOptions = createData.locations
    ? createData.locations.map(l => ({ value: l, label: l }))
    : [];

  const statusOptions = [
    { value: "available", label: "dostępny" },
    { value: "borrowed", label: "wypożyczony" },
    { value: "damaged", label: "uszkodzony" },
    { value: "archived", label: "zarchiwizowany" },
  ];

  const handleSubmit = (e) => {
    setMessage("Tworzenie raportu...");
    e.preventDefault();
    
    const formData = {
      reportName,
      producers: producers.map(option => option.value),
      models: models.map(option => option.value),
      statuses: statuses.map(option => option.value),
      localizations: localizations.map(option => option.value),
    };
    //console.log("Wysłane dane:", formData);

    const createReport = async () => {
      try {
        await axios.post("http://localhost:3000/reports/createReport", formData, {
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
      <h2 className="text-3xl font-semibold mb-6">Utwórz raport: stan magazynu</h2>
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
            <label htmlFor="reportProducer" className="block text-gray-700 mb-2">Producent</label>
            <Select
              isMulti
              options={producerOptions}
              value={producers}
              onChange={setProducers}
              placeholder="wybierz..."
              className="basic-multi-select"
              classNamePrefix="select"
              //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reportModel" className="block text-gray-700 mb-2">Model</label>
            <Select
              isMulti
              options={modelOptions}
              value={models}
              onChange={setModels}
              placeholder="wybierz..."
              className="basic-multi-select"
              classNamePrefix="select"
              //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reportStatus" className="block text-gray-700 mb-2">Status:</label>
            <Select
              isMulti
              options={statusOptions}
              value={statuses}
              onChange={setStatuses}
              placeholder="wybierz..."
              className="basic-multi-select"
              classNamePrefix="select"
              //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reportLocalization" className="block text-gray-700 mb-2">Lokalizacja:</label>
            <Select
              isMulti
              options={localizationOptions}
              value={localizations}
              onChange={setLocalizations}
              placeholder="wybierz..."
              className="basic-multi-select"
              classNamePrefix="select"
              //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
