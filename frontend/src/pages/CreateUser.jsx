import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserName: '',
    UserEmail: '',
    UserPassword: '',
    UserTelephone: '',
    UserWeight: '',
    UserHeight: '',
    UserBirthDate: '',
    UserSex: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:3000/auth/CreateUser', formData);
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data || 'Wystąpił błąd');
    }
  };

  return (
    <div className="CreateUserForm">
      <form onSubmit={handleSubmit}>
        <label>Login:</label>
        <input type="text" name="UserName" value={formData.UserName} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="UserEmail" value={formData.UserEmail} onChange={handleChange} required />

        <label>Hasło:</label>
        <input type="password" name="UserPassword" value={formData.UserPassword} onChange={handleChange} required />

        <label>Telefon:</label>
        <input type="tel" name="UserTelephone" value={formData.UserTelephone} onChange={handleChange} required />

        <label>Waga (kg):</label>
        <input type="number" name="UserWeight" value={formData.UserWeight} onChange={handleChange} required />

        <label>Wzrost (cm):</label>
        <input type="number" name="UserHeight" value={formData.UserHeight} onChange={handleChange} required />

        <label>Data urodzenia:</label>
        <input type="date" name="UserBirthDate" value={formData.UserBirthDate} onChange={handleChange} required />

        <label>Płeć:</label>
        <select name="UserSex" value={formData.UserSex} onChange={handleChange} required>
          <option value="">Wybierz</option>
          <option value="Male">Mężczyzna</option>
          <option value="Female">Kobieta</option>
        </select>

        <button type="submit">Zarejestruj się</button>
      </form>
      {message && <p className="error">{message}</p>}
    </div>
  );
}

export default CreateUser;
