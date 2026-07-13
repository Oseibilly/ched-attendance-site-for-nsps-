import { useState, useEffect } from "react";
import { initDB } from "./db";
import { styles } from "./globalStyles";
import { useToast } from "./index";
import Toast from "./Toast";
import Sidebar from "./Sidebar";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import AdminDashboard from "./AdminDashboard";
import AttendanceLogs from "./AttendanceLogs";
import ManageUsers from "./ManageUsers";
import LocationSetup from "./LocationSetup";
import ClockIn from "./ClockIn";
import EmpHistory from "./EmpHistory";

export default function App() {
  useEffect(() => { initDB(); }, []);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("aiq_session")); }
    catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState(null);
  const { toasts, show } = useToast();

  const login = (u) => {
    sessionStorage.setItem("aiq_session", JSON.stringify(u));
    setUser(u);
    setPage(u.role === "admin" ? "dashboard" : "clockin");
  };

  const logout = () => {
    sessionStorage.removeItem("aiq_session");
    setUser(null);
    setPage(null);
  };

  useEffect(() => {
    if (user && !page) setPage(user.role === "admin" ? "dashboard" : "clockin");
  }, [user]);

  const renderPage = () => {
    if (user.role === "admin") {
      if (page === "dashboard") return <AdminDashboard />;
      if (page === "logs") return <AttendanceLogs />;
      if (page === "users") return <ManageUsers show={show} currentUser={user} />;
      if (page === "location") return <LocationSetup show={show} />;
    } else {
      if (page === "clockin") return <ClockIn user={user} show={show} />;
      if (page === "history") return <EmpHistory user={user} />;
    }
    return null;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="aiq-root">
        {!user ? (
          authMode === "login"
            ? <LoginPage onLogin={login} onSwitch={() => setAuthMode("register")} />
            : <RegisterPage onLogin={login} onSwitch={() => setAuthMode("login")} />
        ) : (
          <div className="app-shell">
            <Sidebar user={user} page={page} setPage={setPage} onLogout={logout} />
            <div className="main-content">{renderPage()}</div>
          </div>
        )}
        <Toast toasts={toasts} />
      </div>
    </>
  );
}