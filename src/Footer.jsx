const packageJson = "0.0.1"

function Footer()
{
    return(
        <div>
            <p>
                &copy; &nbsp;{new Date().getFullYear()}   &nbsp;
                System Zarządzania Urządzeniami sieciowymi w Magazynie
                &nbsp; v:{packageJson}
            </p>

        </div>
    );
}

export default Footer;