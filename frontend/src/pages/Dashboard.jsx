<<<<<<< HEAD
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const panelTitles = {
    'user': ['Stan magazynowy', 'Zarządzanie stanem magazynowym', 'System przyjęć / wydań'],
    'manager': ['Stan magazynowy', 'Zarządzanie stanem magazynowym', 'System przyjęć / wydań', 'Zarządzanie pracownikami', 'Raporty', 'Faktury'],
    'auditor': ['Dokonaj audytu']
=======
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
    const goToInvoices = () => {
      navigate('/invoices');
    };

    return <div>Dashbaord<button onClick={goToInvoices}>Fakrury</button></div>;
>>>>>>> ecd93b841f5b52a37481d0b8631a7e1c011051b1
  };

  const navigate = useNavigate();
  const userToken = sessionStorage.getItem('user');

  const getUserData = async () => {
      const res = await axios.get('http://localhost:3000/users/logged', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUserRole(res.data.role);
  };

  useEffect(() => {
    getUserData()
  }, []);

  const handlePanelClick = (title) => {
    let route = '';

    switch (title) {
      case 'Stan magazynowy':
        route = '/inventory';
        break;
      case 'Zarządzanie stanem magazynowym':
        route = '/manage-inventory';
        break;
      case 'System przyjęć / wydań':
        route = '/transactions';
        break;
      case 'Zarządzanie pracownikami':
        route = '/manage-employees';
        break;
      case 'Raporty':
        route = '/reports';
        break;
      case 'Faktury':
        route = '/invoices';
        break;
      case 'Dokonaj audytu':
        route = '/audit';
        break;
      default:
        route = '/';
    }
    navigate(route);
  };

  return (
    <div className="dashboard flex justify-center p-6">
      {
        userRole && panelTitles[userRole] && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            {panelTitles[userRole].map((title, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-40 flex items-center justify-center"
                onClick={() => handlePanelClick(title)}
              >
                <h3 className="text-sm font-semibold text-center">{title}</h3>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

export default Dashboard;
