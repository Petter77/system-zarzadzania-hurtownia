import { Outlet, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar";

const Layout = ({ userToken, setUserToken }) => {
  if (!userToken) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 shadow-md">
        <TopBar userToken={userToken} setUserToken={setUserToken} />
      </header>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
