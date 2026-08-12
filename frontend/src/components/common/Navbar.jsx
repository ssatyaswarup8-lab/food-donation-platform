import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--card-bg)",
        borderBottom: "1px solid var(--border-color)",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <Link to="/" style={{ fontWeight: "bold", fontSize: 18 }}>
        🍲 FoodDonate
      </Link>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {user && (
          <>
            <Link to="/leaderboard">🏆</Link>
            <Link to="/profile">👤</Link>
            <NotificationBell />
          </>
        )}
        <ThemeToggle />
        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;