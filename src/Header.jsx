import { useState } from "react";


function Header(){
    const [isOpen, setIsOpen] = useState(false);
    
    return( 
        <div className='Header'>
            <button className="hbutton" name="home"><i class="fa fa-home"></i></button>
            <button className="hbutton" name="toolBar"><i class="fa-sharp fa-solid fa-bars"></i></button>
            <input type="search" id="search" placeholder="Serch:"/>
            <button name="account" onClick={()=> setIsOpen(!isOpen)} id="acc"><i class="fa-sharp fa-solid fa-circle-user"></i></button>

            {isOpen &&(
                <div className={`accMenu ${isOpen ? "active" : ""}`}>
                    <button className="accButton">Ustawienia</button>
                    <button className="accButton">Wyloguj</button>
                </div>
            )}

        </div>
    );
}

export default Header;