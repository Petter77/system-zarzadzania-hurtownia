import { Link } from "react-router";
import './TopBar.scss';
import LogoutButton from "../../components/LogoutButton/LogoutButton";

function TopBar({user, setUser}) {

   // console.log(user)
    
    return ( 
        <nav className="TopBar">
            {
                !user ? (
                    <div className="TopBar__links">
                        <Link to="/login" className="link">Login</Link>
                        <Link to="/register" className="link">Register</Link>
                    </div>
                ) : null
            }

            {
                user ? <div className="TopBar__user">{user.UserName}</div> : null
            }
            {
                user ? (
                    <div className="TopBar__logout">
                        <LogoutButton setUser={setUser}/>
                    </div>
                ) : null
            }

        </nav>
     );
}

export default TopBar;