import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  LockKeyhole,
} from "lucide-react";

import "./Unauthorized.css";

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">

      <div className="unauthorized-decoration decoration-one" />
      <div className="unauthorized-decoration decoration-two" />

      <div className="unauthorized-card">

        {/* ICON */}
        <div className="unauthorized-icon-wrapper">
          <div className="unauthorized-icon">
            <ShieldAlert size={42} strokeWidth={1.6} />
          </div>

          <div className="lock-badge">
            <LockKeyhole size={15} />
          </div>
        </div>

        {/* ERROR CODE */}
        <span className="unauthorized-code">
          ERROR 403
        </span>

        {/* TITLE */}
        <h1>
          Access
          <br />
          <span>restricted.</span>
        </h1>

        {/* MESSAGE */}
        <p className="unauthorized-message">
          You don't have permission to view this page.
          Please return to your dashboard or go back to
          the SharePlate home page.
        </p>

        {/* ACTIONS */}
        <div className="unauthorized-actions">

          <button
            type="button"
            className="back-button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={17} />
            Go back
          </button>

          <Link
            to="/"
            className="home-button"
          >
            <Home size={17} />
            Back to home
          </Link>

        </div>

        {/* FOOTER */}
        <div className="unauthorized-footer">
          <ShieldAlert size={14} />
          <span>
            If you believe this is a mistake, contact your
            administrator.
          </span>
        </div>

      </div>

    </div>
  );
};

export default Unauthorized;