import React, { useState } from 'react';
import UsersTab from '../components/audit/UsersTab';
import ItemsTab from '../components/audit/ItemsTab';
import In_out_operationsTab from '../components/audit/in_out_operationsTab';

function Audit() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel Audytu</h1>

      {}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Użytkownicy
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`pb-2 ${activeTab === 'equipment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Sprzęt
        </button>
        <button
          onClick={() => setActiveTab('in_out_operationsTab')}
          className={`pb-2 ${activeTab === 'in_out_operationsTab' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Wydania/Przyjęcia
        </button>
      </div>

      {}
      <div>
        {activeTab === 'users' && <UsersTab key="users"/>}
        {activeTab === 'equipment' && <ItemsTab key="items" />}
        {activeTab === 'in_out_operationsTab' && <In_out_operationsTab key="in_out_operationsTab" />}
      </div>

    </div>
  );
}



export default Audit;