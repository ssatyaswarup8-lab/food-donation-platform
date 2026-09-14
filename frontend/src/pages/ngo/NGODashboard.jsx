import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  Search,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getNearbyFoods } from "../../services/food.service";
import { getMyClaims } from "../../services/claim.service";

import NearbyFoodList from "../../components/ngo/NearbyFoodList";
import ClaimCard from "../../components/ngo/Claimcard";

import ThemeToggle from "../../components/common/ThemeToggle";
import NotificationBell from "../../components/common/NotificationBell";

import "./NGODashboard.css";

const NGODashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("browse");

  const [foods, setFoods] = useState([]);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(10);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH NEARBY FOOD
  // =====================================================

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log(
        `Fetching nearby food within ${distance} km...`
      );

      const data = await getNearbyFoods(distance);

      console.log("Nearby food API response:", data);

      /*
       * getNearbyFoods() already returns res.data.
       *
       * Therefore DO NOT use:
       *
       * setFoods(data.data)
       *
       * because that would look for another "data".
       */

      if (Array.isArray(data)) {
        setFoods(data);
      } else if (Array.isArray(data?.foods)) {
        setFoods(data.foods);
      } else if (Array.isArray(data?.data)) {
        setFoods(data.data);
      } else {
        console.warn(
          "Unexpected nearby food response:",
          data
        );

        setFoods([]);
      }
    } catch (err) {
      console.error(
        "Failed to fetch nearby food:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load nearby food.";

      setError(message);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [distance]);

  // =====================================================
  // FETCH CLAIMS
  // =====================================================

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyClaims();

      console.log("Claims API response:", data);

      if (Array.isArray(data)) {
        setClaims(data);
      } else if (Array.isArray(data?.claims)) {
        setClaims(data.claims);
      } else if (Array.isArray(data?.data)) {
        setClaims(data.data);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error(
        "Failed to fetch claims:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load your claims.";

      setError(message);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD DATA WHEN TAB / DISTANCE CHANGES
  // =====================================================

  useEffect(() => {
    if (activeTab === "browse") {
      fetchFoods();
    } else if (activeTab === "claims") {
      fetchClaims();
    }
  }, [
    activeTab,
    distance,
    fetchFoods,
    fetchClaims,
  ]);

  // =====================================================
  // AFTER CLAIM
  // =====================================================

  const handleClaimed = () => {
    fetchFoods();
  };

  // =====================================================
  // TAB CHANGE
  // =====================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <div className="ngo-dashboard">

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="ngo-dashboard-bg" />

      <div className="ngo-dashboard-shell">

        {/* =================================================
            TOP BAR
            ================================================= */}

        <div className="ngo-topbar">

          <div className="ngo-topbar-brand">

            <div className="ngo-brand-mark">
              <Leaf size={18} />
            </div>

            <div>
              <span className="ngo-brand-name">
                Share<span>Plate</span>
              </span>

              <span className="ngo-brand-section">
                NGO workspace
              </span>
            </div>

          </div>

          <div className="ngo-topbar-actions">
            <NotificationBell />
            <ThemeToggle />
          </div>

        </div>

        {/* =================================================
            WELCOME SECTION
            ================================================= */}

        <section className="ngo-welcome">

          <div className="ngo-welcome-copy">

            <span className="ngo-eyebrow">
              NGO DASHBOARD
            </span>

            <h1>
              Welcome back,
              <br />
              <span>
                {user?.name || "Partner"}.
              </span>
            </h1>

            <p>
              Find surplus food near your community,
              claim what you need, and help turn excess
              into meaningful meals.
            </p>

          </div>

          <div className="ngo-welcome-side">

            <div className="ngo-network-status">

              <span className="ngo-live-dot" />

              <span>
                Food network active
              </span>

            </div>

            <div className="ngo-location-label">
              <MapPin size={11} />
              LOCAL DONATIONS
            </div>

          </div>

        </section>

        {/* =================================================
            VERIFICATION WARNING
            ================================================= */}

        {!user?.isVerified && (
          <div className="ngo-verification">

            <div className="ngo-verification-icon">
              <ShieldAlert size={19} />
            </div>

            <div className="ngo-verification-content">

              <strong>
                Your NGO account is awaiting verification
              </strong>

              <p>
                An administrator needs to verify your NGO
                before nearby food listings become
                available.
              </p>

            </div>

            <div className="ngo-verification-status">
              <Clock3 size={13} />
              Pending
            </div>

          </div>
        )}

        {/* =================================================
            API ERROR
            ================================================= */}

        {error && (
          <div
            className="ngo-verification"
            style={{
              marginBottom: "18px",
            }}
          >

            <div className="ngo-verification-icon">
              <ShieldAlert size={19} />
            </div>

            <div className="ngo-verification-content">

              <strong>
                Unable to load data
              </strong>

              <p>
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={
                activeTab === "browse"
                  ? fetchFoods
                  : fetchClaims
              }
              style={{
                whiteSpace: "nowrap",
              }}
            >
              Retry
            </button>

          </div>
        )}

        {/* =================================================
            QUICK STATS
            ================================================= */}

        <section className="ngo-stats">

          {/* Nearby food */}

          <div className="ngo-stat-card">

            <div className="ngo-stat-icon">
              <PackageCheck size={18} />
            </div>

            <div>

              <span>
                NEARBY FOOD
              </span>

              <strong>
                {loading && activeTab === "browse"
                  ? "—"
                  : foods.length}
              </strong>

              <p>
                Available listings
              </p>

            </div>

          </div>

          {/* Claims */}

          <div className="ngo-stat-card">

            <div className="ngo-stat-icon">
              <HeartHandshake size={18} />
            </div>

            <div>

              <span>
                MY CLAIMS
              </span>

              <strong>
                {loading && activeTab === "claims"
                  ? "—"
                  : claims.length}
              </strong>

              <p>
                Food you've claimed
              </p>

            </div>

          </div>

          {/* Account status */}

          <div className="ngo-stat-card">

            <div className="ngo-stat-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>

              <span>
                ACCOUNT STATUS
              </span>

              <strong>
                {user?.isVerified
                  ? "Verified"
                  : "Pending"}
              </strong>

              <p>
                {user?.isVerified
                  ? "Ready to receive food"
                  : "Verification required"}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            TAB NAVIGATION
            ================================================= */}

        <section className="ngo-navigation">

          <div className="ngo-tabs">

            <button
              type="button"
              className={
                activeTab === "browse"
                  ? "ngo-tab active"
                  : "ngo-tab"
              }
              onClick={() =>
                handleTabChange("browse")
              }
            >

              <Search size={15} />

              <span>
                Browse nearby food
              </span>

              {activeTab === "browse" && (
                <span className="ngo-tab-indicator" />
              )}

            </button>

            <button
              type="button"
              className={
                activeTab === "claims"
                  ? "ngo-tab active"
                  : "ngo-tab"
              }
              onClick={() =>
                handleTabChange("claims")
              }
            >

              <HeartHandshake size={15} />

              <span>
                My claims
              </span>

              {claims.length > 0 && (
                <span className="ngo-tab-count">
                  {claims.length}
                </span>
              )}

              {activeTab === "claims" && (
                <span className="ngo-tab-indicator" />
              )}

            </button>

          </div>

        </section>

        {/* =================================================
            BROWSE TAB
            ================================================= */}

        {activeTab === "browse" && (
          <section className="ngo-content-section">

            <div className="ngo-section-header">

              <div>

                <span className="ngo-section-eyebrow">
                  DISCOVER DONATIONS
                </span>

                <h2>
                  Food near
                  <span> you.</span>
                </h2>

                <p>
                  Browse available surplus food within
                  your selected search radius.
                </p>

              </div>

              <div className="ngo-radius-control">

                <label htmlFor="ngo-distance">
                  <MapPin size={13} />
                  Search radius
                </label>

                <select
                  id="ngo-distance"
                  value={distance}
                  onChange={(e) =>
                    setDistance(
                      Number(e.target.value)
                    )
                  }
                >

                  <option value={5}>
                    5 km
                  </option>

                  <option value={10}>
                    10 km
                  </option>

                  <option value={20}>
                    20 km
                  </option>

                  <option value={50}>
                    50 km
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                RADIUS SUMMARY
                ================================================= */}

            <div className="ngo-radius-summary">

              <div className="radius-summary-icon">
                <MapPin size={16} />
              </div>

              <div>

                <strong>
                  Showing food within {distance} km
                </strong>

                <span>
                  Expand the radius to discover more
                  available donations.
                </span>

              </div>

              <ArrowRight size={15} />

            </div>

            {/* =================================================
                FOOD LIST
                ================================================= */}

            <div className="ngo-food-card">

              <NearbyFoodList
                foods={foods}
                onClaimed={handleClaimed}
                loading={loading}
              />

            </div>

          </section>
        )}

        {/* =================================================
            CLAIMS TAB
            ================================================= */}

        {activeTab === "claims" && (
          <section className="ngo-content-section">

            <div className="ngo-section-header">

              <div>

                <span className="ngo-section-eyebrow">
                  YOUR ACTIVITY
                </span>

                <h2>
                  My claim
                  <span> history.</span>
                </h2>

                <p>
                  Track the food donations your
                  organization has claimed.
                </p>

              </div>

              <div className="ngo-claims-count">

                <span>
                  TOTAL CLAIMS
                </span>

                <strong>
                  {claims.length}
                </strong>

              </div>

            </div>

            {loading ? (

              <div className="ngo-claims-loading">

                <div className="ngo-loading-card">

                  <div className="ngo-loading-line large" />
                  <div className="ngo-loading-line medium" />
                  <div className="ngo-loading-line small" />

                </div>

                <div className="ngo-loading-card">

                  <div className="ngo-loading-line large" />
                  <div className="ngo-loading-line medium" />
                  <div className="ngo-loading-line small" />

                </div>

              </div>

            ) : claims.length === 0 ? (

              <div className="ngo-empty-state">

                <div className="ngo-empty-icon">
                  <HeartHandshake size={25} />
                </div>

                <span className="ngo-section-eyebrow">
                  NO CLAIMS YET
                </span>

                <h3>
                  Your first claim starts here.
                </h3>

                <p>
                  Browse nearby surplus food and claim
                  donations that can help your community.
                </p>

                <button
                  type="button"
                  className="ngo-empty-button"
                  onClick={() =>
                    handleTabChange("browse")
                  }
                >

                  Browse nearby food

                  <ArrowRight size={14} />

                </button>

              </div>

            ) : (

              <div className="ngo-claims-list">

                {claims.map((claim) => (

                  <ClaimCard
                    key={claim._id}
                    claim={claim}
                    onChanged={fetchClaims}
                  />

                ))}

              </div>

            )}

          </section>
        )}

        {/* =================================================
            COMMUNITY MESSAGE
            ================================================= */}

        <section className="ngo-community-card">

          <div className="ngo-community-icon">
            <UsersRound size={20} />
          </div>

          <div>

            <span>
              TOGETHER, WE CAN DO MORE
            </span>

            <strong>
              Every successful claim helps keep good
              food out of the waste stream.
            </strong>

          </div>

          <ChevronRight size={17} />

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="ngo-footer">

          <div className="ngo-footer-brand">

            <Leaf size={14} />

            <span>
              SharePlate
            </span>

          </div>

          <span>
            Connecting surplus food with communities.
          </span>

        </footer>

      </div>

    </div>
  );
};

export default NGODashboard;