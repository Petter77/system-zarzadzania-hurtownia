import { Outlet, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";

const Layout = ({ userToken, setUserToken }) => {
  if (!userToken) {
    return <Navigate to="/auth" replace />;
  }
  return (
    <>
      <header>
        <TopBar userToken={userToken} setUserToken={setUserToken} />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
