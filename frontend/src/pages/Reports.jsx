import { useEffect, useState } from "react";
import axios from "axios";

const Reports = ({ userToken }) => {
  const placeholder = () => {
    alert("w koloni!")
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6">Raporty</h2>
      <p>Tu będzie San Francisco</p>
      <button
        onClick={() => placeholder()}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Witajcie
      </button>
    </div>
  );
};

export default Reports;
