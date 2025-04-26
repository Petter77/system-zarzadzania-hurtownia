import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
    const goToInvoices = () => {
      navigate('/invoices');
    };

    return <div>Dashbaord<button onClick={goToInvoices}>Fakrury</button></div>;
  };
  
  export default Dashboard;
  