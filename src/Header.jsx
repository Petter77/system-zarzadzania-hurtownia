
function Header(){
    return(
        <div className='Header'>
            <button className="hbutton" name="home">Home</button>
            <button className="hbutton" name="toolBar">ToolBar</button>
            <input type="search" id="search" placeholder="Serch:"/>
            <button name="account" id="acc">A</button>

        </div>
    );
}

export default Header;