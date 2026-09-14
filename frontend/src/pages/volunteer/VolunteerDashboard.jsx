import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Leaf,
  MapPin,
  Medal,
  Navigation,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
  Trophy,
  UserRound,
  Bike,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getMyDeliveries } from "../../services/delivery.service";

import DeliveryCard from "../../components/volunteer/DeliveryCard";
import { SkeletonCard } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import InfoTipCard from "../../components/common/InfoTipCard";
import NotificationBell from "../../components/common/NotificationBell";
import ThemeToggle from "../../components/common/ThemeToggle";

import "./VolunteerDashboard.css";

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  const fetchDeliveries = async () => {
    setLoading(true);

    try {
      const res = await getMyDeliveries();
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  /* =====================================================
     LIVE VOLUNTEER LOCATION
     ===================================================== */

  useEffect(() => {
    if (!socket) return;

    const activeDelivery = deliveries.find((delivery) =>
      ["assigned", "picked_up"].includes(
        delivery.status
      )
    );

    if (
      !activeDelivery ||
      !navigator.geolocation
    ) {
      return;
    }

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          socket.emit(
            "volunteer-location-update",
            {
              deliveryId: activeDelivery._id,
              longitude: pos.coords.longitude,
              latitude: pos.coords.latitude,
            }
          );
        }
      );
    };

    sendLocation();

    const interval = setInterval(
      sendLocation,
      10000
    );

    return () => clearInterval(interval);
  }, [socket, deliveries]);

  /* =====================================================
     STATS
     ===================================================== */

  const stats = useMemo(() => {
    const completed = deliveries.filter(
      (delivery) =>
        delivery.status === "completed"
    ).length;

    const active = deliveries.filter(
      (delivery) =>
        ["assigned", "picked_up"].includes(
          delivery.status
        )
    ).length;

    const totalMeals = deliveries
      .filter(
        (delivery) =>
          delivery.status === "completed"
      )
      .reduce(
        (sum, delivery) =>
          sum +
          (delivery.foodId?.quantity || 0),
        0
      );

    return {
      completed,
      active,
      totalMeals,
    };
  }, [deliveries]);

  /* =====================================================
     FILTER
     ===================================================== */

  const filteredDeliveries = deliveries.filter(
    (delivery) => {
      if (filter === "active") {
        return ![
          "completed",
          "cancelled",
        ].includes(delivery.status);
      }

      if (filter === "completed") {
        return delivery.status === "completed";
      }

      return true;
    }
  );

  return (
    <div className="volunteer-dashboard">

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="volunteer-dashboard-bg" />

      <div className="volunteer-dashboard-shell">

        {/* =================================================
            TOP BAR
            ================================================= */}

        <div className="volunteer-topbar">

          <div className="volunteer-topbar-brand">

            <div className="volunteer-brand-mark">
              <Leaf size={18} />
            </div>

            <div>
              <span className="volunteer-brand-name">
                Share<span>Plate</span>
              </span>

              <span className="volunteer-brand-section">
                Volunteer workspace
              </span>
            </div>

          </div>

          <div className="volunteer-topbar-actions">

            <Link
              to="/leaderboard"
              className="volunteer-icon-link"
              title="Leaderboard"
            >
              <Trophy size={16} />
            </Link>

            <Link
              to="/profile"
              className="volunteer-icon-link"
              title="Profile"
            >
              <UserRound size={16} />
            </Link>

            <NotificationBell />

            <ThemeToggle />

            <button
              type="button"
              className="volunteer-logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </div>

        {/* =================================================
            WELCOME
            ================================================= */}

        <section className="volunteer-welcome">

          <div className="volunteer-welcome-copy">

            <span className="volunteer-eyebrow">
              VOLUNTEER DASHBOARD
            </span>

            <h1>
              Welcome back,
              <br />
              <span>{user?.name || "Volunteer"}.</span>
            </h1>

            <p>
              Pick up surplus food, deliver it where
              it's needed, and turn every trip into
              a meal saved.
            </p>

          </div>

          <div className="volunteer-welcome-side">

            <div className="volunteer-live-status">

              <span className="volunteer-live-dot" />

              <span>
                Delivery network active
              </span>

            </div>

            <div className="volunteer-route-label">

              <Navigation size={11} />

              LIVE DELIVERY SUPPORT

            </div>

          </div>

        </section>

        {/* =================================================
            VERIFICATION
            ================================================= */}

        {!user?.isVerified && (
          <div className="volunteer-verification">

            <div className="volunteer-verification-icon">
              <ShieldAlert size={19} />
            </div>

            <div className="volunteer-verification-content">

              <strong>
                Your volunteer account is awaiting
                verification
              </strong>

              <p>
                You won't be assigned deliveries until
                an administrator verifies your account.
              </p>

            </div>

            <div className="volunteer-verification-status">

              <Clock3 size={13} />

              Pending

            </div>

          </div>
        )}

        {/* =================================================
            STATS
            ================================================= */}

        <section className="volunteer-stats">

          <div className="volunteer-stat-card">

            <div className="volunteer-stat-icon active">
              <Bike size={18} />
            </div>

            <div>

              <span>
                ACTIVE DELIVERIES
              </span>

              <strong>
                {stats.active}
              </strong>

              <p>
                Currently assigned
              </p>

            </div>

          </div>

          <div className="volunteer-stat-card">

            <div className="volunteer-stat-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>

              <span>
                COMPLETED
              </span>

              <strong>
                {stats.completed}
              </strong>

              <p>
                Successful deliveries
              </p>

            </div>

          </div>

          <div className="volunteer-stat-card">

            <div className="volunteer-stat-icon">
              <PackageCheck size={18} />
            </div>

            <div>

              <span>
                MEALS DELIVERED
              </span>

              <strong>
                {stats.totalMeals}
              </strong>

              <p>
                Food reaching communities
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            IMPACT STRIP
            ================================================= */}

        <section className="volunteer-impact-strip">

          <div className="impact-strip-icon">
            <Medal size={19} />
          </div>

          <div className="impact-strip-copy">

            <span>
              YOUR IMPACT
            </span>

            <strong>
              Every completed delivery moves a meal
              closer to someone who needs it.
            </strong>

          </div>

          <div className="impact-strip-number">

            <strong>
              {stats.totalMeals}
            </strong>

            <span>
              meals delivered
            </span>

          </div>

        </section>

        {/* =================================================
            DELIVERY SECTION
            ================================================= */}

        <section className="volunteer-delivery-section">

          <div className="volunteer-section-heading">

            <div>

              <span className="volunteer-section-eyebrow">
                DELIVERY BOARD
              </span>

              <h2>
                Your delivery
                <span> routes.</span>
              </h2>

              <p>
                Track assigned pickups, active routes,
                and completed deliveries.
              </p>

            </div>

            <button
              type="button"
              className="volunteer-refresh"
              onClick={fetchDeliveries}
              disabled={loading}
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "refresh-spinning"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

          {/* FILTERS */}

          <div className="volunteer-filters">

            <button
              type="button"
              className={
                filter === "active"
                  ? "volunteer-filter active"
                  : "volunteer-filter"
              }
              onClick={() =>
                setFilter("active")
              }
            >
              <Navigation size={13} />
              Active

              <span>
                {
                  deliveries.filter(
                    (delivery) =>
                      ![
                        "completed",
                        "cancelled",
                      ].includes(
                        delivery.status
                      )
                  ).length
                }
              </span>

            </button>

            <button
              type="button"
              className={
                filter === "completed"
                  ? "volunteer-filter active"
                  : "volunteer-filter"
              }
              onClick={() =>
                setFilter("completed")
              }
            >
              <CheckCircle2 size={13} />
              Completed

              <span>
                {stats.completed}
              </span>

            </button>

            <button
              type="button"
              className={
                filter === "all"
                  ? "volunteer-filter active"
                  : "volunteer-filter"
              }
              onClick={() =>
                setFilter("all")
              }
            >
              <PackageCheck size={13} />
              All

              <span>
                {deliveries.length}
              </span>

            </button>

          </div>

          {/* DELIVERY LIST */}

          {loading ? (
            <div className="volunteer-loading-list">

              <SkeletonCard />

              <SkeletonCard />

            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="volunteer-empty-wrapper">

              <EmptyState
                icon={
                  filter === "completed"
                    ? "🎉"
                    : "🛵"
                }
                title={
                  filter === "completed"
                    ? "No completed deliveries yet"
                    : "No deliveries assigned right now"
                }
                subtitle={
                  filter === "completed"
                    ? "Once you complete a delivery, it'll show up here with your impact stats."
                    : "Sit tight — an admin will assign you a nearby pickup as soon as one's available. Make sure your account is verified and location access is enabled."
                }
              />

            </div>
          ) : (
            <div className="volunteer-delivery-list">

              {filteredDeliveries.map(
                (delivery, index) => (
                  <div
                    key={delivery._id}
                    className="volunteer-delivery-item"
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <DeliveryCard
                      delivery={delivery}
                      onChanged={
                        fetchDeliveries
                      }
                    />
                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            WAITING / INFO
            ================================================= */}

        {filteredDeliveries.length === 0 &&
          !loading && (
            <section className="volunteer-info-section">

              <div className="volunteer-info-heading">

                <span>
                  READY FOR YOUR NEXT ROUTE?
                </span>

                <strong>
                  A few things you can do while you wait.
                </strong>

              </div>

              <InfoTipCard
                icon="💡"
                title="While you wait"
                tips={[
                  "Keep location access enabled so you get matched to the nearest pickup.",
                  "Check your Profile to make sure your address and phone number are up to date.",
                  "Once assigned, you'll get a real-time notification and live map tracking.",
                  "Completed deliveries earn you a spot on the Leaderboard 🏆",
                ]}
              />

            </section>
          )}

        {/* =================================================
            LOCATION NOTICE
            ================================================= */}

        <section className="volunteer-location-card">

          <div className="location-card-icon">
            <MapPin size={18} />
          </div>

          <div>

            <span>
              LOCATION SERVICES
            </span>

            <strong>
              Keep location access enabled
            </strong>

            <p>
              Your location is shared during an active
              delivery so the platform can provide
              real-time route tracking.
            </p>

          </div>

          <ChevronRight size={16} />

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="volunteer-footer">

          <div className="volunteer-footer-brand">

            <Leaf size={14} />

            <span>
              SharePlate
            </span>

          </div>

          <span>
            Every trip helps make surplus food useful.
          </span>

        </footer>

      </div>

    </div>
  );
};

export default VolunteerDashboard;