import { useEffect, useState } from "react";
import axios from "axios";
import CreateUserForm from "../components/CreateUserForm";
import EditUserForm from "../components/EditUserForm";

const ManageUsers = ({ userToken }) => {
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const getAllusers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/all", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUsers(res.data.results);
    } catch (err) {
      console.log(err);
      setMessage("Błąd podczas pobierania użytkowników.");
    }
  };

  useEffect(() => {
    getAllusers();
  }, [users]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/users/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      getAllusers();
      setMessage("Użytkownik został usunięty pomyślnie");
    } catch (err) {
      console.log(err);
      setMessage("Błąd podczas usuwania użytkownika.");
    }
  };

  const handleEdit = (id) => {
    setUserId(id);
    setIsEditFormOpen(true);
  };

  return (
    <div>
      <h2>Lista użytkowników</h2>
      <button onClick={() => setIsCreateFormOpen(true)}>
        Utwórz nowego użytkownika
      </button>
      {message && <p style={{ color: "red" }}>{message}</p>}
      {!users ? (
        <p>Brak użytkowników w systemie</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Login</th>
              <th>Rola</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user.id)}>Edytuj</button>{" "}
                  <button onClick={() => handleDelete(user.id)}>Usuń</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isCreateFormOpen ? (
        <CreateUserForm setIsCreateFormOpen={setIsCreateFormOpen} />
      ) : null}
      {isEditFormOpen && !isCreateFormOpen ? (
        <EditUserForm setIsEditFormOpen={setIsEditFormOpen} userId={userId} />
      ) : null}
    </div>
  );
};

export default ManageUsers;
