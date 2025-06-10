import React from "react";
import { useNavigate } from "react-router-dom";

const ManageInventory = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center bg-gray-100 p-0 pt-10">
      <h1 className="text-3xl font-bold mb-8 mt-4">Zarządzanie stanem magazynowym</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div
          onClick={() => navigate("/manageInventory/add")}
          className="cursor-pointer bg-white rounded-xl shadow-lg p-10 flex flex-col items-center justify-center hover:bg-blue-50 transition w-72 h-48"
        >
          <span className="text-5xl mb-4">➕</span>
          <span className="text-xl font-semibold">Dodaj sprzęt</span>
        </div>
        <div
          onClick={() => navigate("/manageInventory/edit")}
          className="cursor-pointer bg-white rounded-xl shadow-lg p-10 flex flex-col items-center justify-center hover:bg-blue-50 transition w-72 h-48"
        >
          <span className="text-5xl mb-4">📝</span>
          <span className="text-xl font-semibold">Edytuj/Usuń sprzęt</span>
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;