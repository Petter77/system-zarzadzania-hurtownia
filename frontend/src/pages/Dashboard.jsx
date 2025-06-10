import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWarehouse, FaBoxes, FaExchangeAlt, FaUsersCog, FaFileAlt, FaFileInvoice, FaUserCheck } from "react-icons/fa";

const iconMap = {
  "Stan magazynowy": <FaWarehouse className="text-5xl mb-4 text-blue-600" />,
  "Zarządzanie stanem magazynowym": <FaBoxes className="text-5xl mb-4 text-green-600" />,
  "System przyjęć/wydań": <FaExchangeAlt className="text-5xl mb-4 text-yellow-600" />,
  "Zarządzanie pracownikami": <FaUsersCog className="text-5xl mb-4 text-purple-600" />,
  "Raporty": <FaFileAlt className="text-5xl mb-4 text-gray-600" />,
  "Faktury": <FaFileInvoice className="text-5xl mb-4 text-indigo-600" />,
  "Dokonaj audytu": <FaUserCheck className="text-5xl mb-4 text-red-600" />,
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const panelTitles = {
    'user': ['Stan magazynowy', 'Zarządzanie stanem magazynowym', 'System przyjęć/wydań'],
    'manager': ['Stan magazynowy', 'Zarządzanie stanem magazynowym', 'System przyjęć/wydań', 'Zarządzanie pracownikami', 'Raporty', 'Faktury'],
    'auditor': ['Dokonaj audytu']
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
    getUserData();
  }, []);

  const handlePanelClick = (title) => {
    let route = '';

    switch (title) {
      case 'Stan magazynowy':
        route = '/inventory';
        break;
      case 'Zarządzanie stanem magazynowym':
        route = '/manageInventory';
        break;
      case 'System przyjęć/wydań':
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
            {panelTitles[userRole].map((title, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center w-72 h-48"
                onClick={() => handlePanelClick(title)}
              >
                {iconMap[title]}
                <span className="text-xl font-semibold text-center">{title}</span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

export default Dashboard;