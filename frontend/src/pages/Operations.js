import React from 'react';
import OperationForm from '../components/OperationForm';
import OperationList from '../components/OperationList';

function Operations() {
  return (
    <div>
      <h1>Manage Warehouse Operations</h1>
      <OperationForm />
      <OperationList />
    </div>
  );
}

export default Operations;