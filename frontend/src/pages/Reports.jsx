import { useEffect, useState } from "react";
import axios from "axios";
import CreateReportInventory from "../components/CreateReportInventory";
import CreateReportInvoices from "../components/CreateReportInvoices";
import ViewReportInventory from "../components/ViewReportInventory";
import ViewReportInvoices from "../components/ViewReportInvoices";

const Reports = ({ userToken }) => {
  const [activeModule, setActiveModule] = useState("view");
  const [activeSecondStep, setActiveSecondStep] = useState("inventory");

  const renderModule = () => {
    switch (activeModule) {
      case "view":
        switch (activeSecondStep) {
          case "inventory":
            return <ViewReportInventory userToken={userToken} />;
          case "invoices":
            return <ViewReportInvoices userToken={userToken} />;
          default:
            return null;
        }
      case "create":
        switch (activeSecondStep) {
          case "inventory":
            return <CreateReportInventory userToken={userToken} />;
          case "invoices":
            return <CreateReportInvoices userToken={userToken} />;
          default:
            return null;
        }
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Raporty</h2>
      <div className="reports-buttons flex gap-x-8 items-center">
        <button
          onClick={() => {
            setActiveModule("view");
            setActiveSecondStep("inventory");
          }}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Wyświetl raporty
        </button>
        <button
          onClick={() => {
            setActiveModule("create");
            setActiveSecondStep("inventory");
          }}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Utwórz raport
        </button>
      </div>
      <hr className="border-t-2 border-gray-400 my-4" />
      <div className="reports-buttons flex gap-x-8 items-center">
        <h3 className="text-2xl font-semibold mb-6">Typy:</h3>
        <button
          onClick={() => setActiveSecondStep("inventory")}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Stan magazynu
        </button>
        <button
          onClick={() => setActiveSecondStep("invoices")}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Faktury
        </button>
      </div>
      <div className="reports-module">
        {renderModule()}
      </div>
    </div>
  );
};

export default Reports;
