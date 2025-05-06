import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OperationList() {
  const [operations, setOperations] = useState([]);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const token = localStorage.getItem('token'); // Pobierz token JWT
        const response = await axios.get('http://localhost:3000/api/operations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOperations(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOperations();
  }, []);

  return (
    <div>
      <h2>Operation List</h2>
      <ul>
        {operations.map((operation) => (
          <li key={operation.id}>
            {operation.type} - {operation.quantity} (Instance ID: {operation.instance_id})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OperationList;