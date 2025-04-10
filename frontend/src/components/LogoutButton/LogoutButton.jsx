import { useNavigate } from 'react-router-dom';

const LogoutButton = ({setUser}) => {
    
    const navigate = useNavigate();

    const handleLogout = () =>{
        sessionStorage.removeItem('user')
        setUser(null)
        navigate('/');
    }

    return (  
      <button onClick={handleLogout}>Wyloguj się</button>  
    );
}
 
export default LogoutButton;