import React from 'react';
import UsersTab from '../components/audit/UsersTab'; 

function Audit() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel Audytu Użytkowników</h1>

      <UsersTab />
    </div>
  );
}

export default Audit;
