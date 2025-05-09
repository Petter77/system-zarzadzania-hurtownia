import { useEffect, useState } from "react";
import axios from "axios";
import CreateReport from "../components/CreateReport";
import ViewReport from "../components/ViewReport";

const Reports = ({ userToken }) => {
  const [activeModule, setActiveModule] = useState("view");

  const renderModule = () => {
    switch (activeModule) {
      case "view":
        return <ViewReport userToken={userToken} />;
      case "create":
        return <CreateReport userToken={userToken} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Raporty</h2>
      <div className="reports-buttons flex gap-x-8 items-center">
        <button
          onClick={() => setActiveModule("view")}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Wyświetl raporty
        </button>
        <button
          onClick={() => setActiveModule("create")}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Utwórz raport
        </button>
      </div>
      <hr className="border-t-2 border-gray-400 my-4" />
      <div className="reports-module">
        {renderModule()}
      </div>
    </div>
  );
};

export default Reports;
