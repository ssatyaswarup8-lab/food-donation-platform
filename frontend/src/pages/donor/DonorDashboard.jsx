import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Leaf,
  PackageCheck,
  Plus,
  ShieldAlert,
  Sparkles,
  Utensils,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getMyFoods } from "../../services/food.service";

import FoodPostForm from "../../components/donor/FoodPostForm";
import DonorFoodList from "../../components/donor/DonorFoodList";
import EditFoodModal from "../../components/donor/EditFoodModal";
import SpoilagePredictor from "../../components/donor/spoilagePredictor";
import DonationHistory from "../../components/donor/DonationHistory";

import { SkeletonCard } from "../../components/common/Skeleton";
import ThemeToggle from "../../components/common/ThemeToggle";
import NotificationBell from "../../components/common/NotificationBell";
import DashboardHeader from "../../components/common/DashboardHeader";

import "./DonorDashboard.css";

const DonorDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFood, setEditingFood] = useState(null);

  const fetchFoods = async () => {
    setLoading(true);

    try {
      const res = await getMyFoods();
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleClaimed = (data) => {
      toast.success(
        `"${data.foodName}" was claimed by ${data.claimedBy}!`
      );

      fetchFoods();
    };

    const handleApproved = (data) => {
      toast.success(
        `"${data.foodName}" passed quality review!`
      );

      fetchFoods();
    };

    const handleRejected = (data) => {
      toast.error(
        `"${data.foodName}" was rejected: ${data.reason}`
      );

      fetchFoods();
    };

    socket.on("food-claimed", handleClaimed);
    socket.on("food-quality-approved", handleApproved);
    socket.on("food-quality-rejected", handleRejected);

    return () => {
      socket.off("food-claimed", handleClaimed);
      socket.off("food-quality-approved", handleApproved);
      socket.off("food-quality-rejected", handleRejected);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div className="donor-dashboard">

      {/* =================================================
          PAGE BACKGROUND
          ================================================= */}

      <div className="donor-dashboard-bg" />

      <div className="donor-dashboard-shell">

        {/* =================================================
            TOP HEADER
            ================================================= */}

        <div className="donor-topbar">

          <div className="donor-topbar-brand">

            <div className="donor-brand-mark">
              <Leaf size={18} />
            </div>

            <div>
              <span className="donor-brand-name">
                Share<span>Plate</span>
              </span>

              <span className="donor-brand-section">
                Donor workspace
              </span>
            </div>

          </div>

          <div className="donor-topbar-actions">

            <NotificationBell />

            <ThemeToggle />

          </div>

        </div>

        {/* =================================================
            WELCOME HEADER
            ================================================= */}

        <section className="donor-welcome">

          <div className="donor-welcome-copy">

            <span className="donor-eyebrow">
              DONOR DASHBOARD
            </span>

            <h1>
              Welcome back,
              <br />
              <span>{user?.name || "Donor"}.</span>
            </h1>

            <p>
              Turn surplus food into meaningful meals.
              Manage your donations, monitor quality, and
              see the impact you're creating.
            </p>

          </div>

          <div className="donor-welcome-side">

            <div className="donor-live-indicator">

              <span className="live-dot" />

              <span>
                Donation network active
              </span>

            </div>

            <div className="donor-date-label">
              YOUR FOOD • YOUR IMPACT
            </div>

          </div>

        </section>

        {/* =================================================
            VERIFICATION NOTICE
            ================================================= */}

        {!user?.isVerified && (
          <div className="donor-verification">

            <div className="verification-icon">
              <ShieldAlert size={19} />
            </div>

            <div className="verification-content">

              <strong>
                Your account is awaiting verification
              </strong>

              <p>
                You can still post food, but visibility to
                NGOs may be limited until an administrator
                verifies your account.
              </p>

            </div>

            <div className="verification-status">
              <Clock3 size={14} />
              Pending
            </div>

          </div>
        )}

        {/* =================================================
            QUICK STATS
            ================================================= */}

        <section className="donor-stats">

          <div className="donor-stat-card">

            <div className="donor-stat-icon">
              <Utensils size={18} />
            </div>

            <div>
              <span>
                ACTIVE LISTINGS
              </span>

              <strong>
                {loading ? "—" : foods.length}
              </strong>

              <p>
                Food posts
              </p>
            </div>

          </div>

          <div className="donor-stat-card">

            <div className="donor-stat-icon">
              <PackageCheck size={18} />
            </div>

            <div>
              <span>
                DONATION NETWORK
              </span>

              <strong>
                Live
              </strong>

              <p>
                NGOs can discover your food
              </p>
            </div>

          </div>

          <div className="donor-stat-card">

            <div className="donor-stat-icon">
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
                  ? "Ready for donations"
                  : "Verification required"}
              </p>
            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS
            ================================================= */}

        <section className="donor-quick-actions">

          <Link
            to="#post-food"
            className="donor-primary-action"
          >
            <span className="action-icon">
              <Plus size={17} />
            </span>

            <span>
              <strong>
                Post surplus food
              </strong>

              <small>
                Create a new donation
              </small>
            </span>

            <ArrowRight size={15} />

          </Link>

          <a
            href="#my-donations"
            className="donor-secondary-action"
          >
            <span>
              View my donations
            </span>

            <ChevronRight size={15} />

          </a>

        </section>

        {/* =================================================
            ANALYTICS SECTION
            ================================================= */}

        <section className="donor-section">

          <div className="donor-section-heading">

            <div>

              <span className="section-eyebrow">
                SMART TOOLS
              </span>

              <h2>
                Protect your
                <span> surplus.</span>
              </h2>

            </div>

            <div className="section-heading-icon">
              <Sparkles size={17} />
            </div>

          </div>

          <div className="donor-spoilage-card">
            <SpoilagePredictor />
          </div>

        </section>

        {/* =================================================
            DONATION HISTORY
            ================================================= */}

        <section
          className="donor-section"
          id="my-donations"
        >

          <div className="donor-section-heading">

            <div>

              <span className="section-eyebrow">
                YOUR ACTIVITY
              </span>

              <h2>
                Donation
                <span> history.</span>
              </h2>

            </div>

            <div className="section-heading-icon">
              <Bell size={17} />
            </div>

          </div>

          <div className="donor-history-card">
            <DonationHistory />
          </div>

        </section>

        {/* =================================================
            POST FOOD
            ================================================= */}

        <section
          className="donor-section"
          id="post-food"
        >

          <div className="donor-section-heading">

            <div>

              <span className="section-eyebrow">
                MAKE AN IMPACT
              </span>

              <h2>
                Share your
                <span> surplus.</span>
              </h2>

            </div>

            <div className="section-heading-icon">
              <Plus size={17} />
            </div>

          </div>

          <div className="donor-form-card">

            <div className="donor-form-intro">

              <div className="form-intro-icon">
                <Utensils size={18} />
              </div>

              <div>

                <strong>
                  Create a food donation
                </strong>

                <p>
                  Tell NGOs what food is available,
                  when it should be collected, and
                  how much you have.
                </p>

              </div>

            </div>

            <FoodPostForm
              onFoodPosted={fetchFoods}
            />

          </div>

        </section>

        {/* =================================================
            MY FOOD LIST
            ================================================= */}

        <section className="donor-section">

          <div className="donor-section-heading">

            <div>

              <span className="section-eyebrow">
                INVENTORY
              </span>

              <h2>
                Your food
                <span> listings.</span>
              </h2>

            </div>

            <div className="listing-count">

              {loading
                ? "Loading..."
                : `${foods.length} listing${
                    foods.length === 1
                      ? ""
                      : "s"
                  }`}

            </div>

          </div>

          <div className="donor-food-list-card">

            {loading ? (
              <div className="donor-skeletons">

                <SkeletonCard />
                <SkeletonCard />

              </div>
            ) : (
              <DonorFoodList
                foods={foods}
                onFoodChanged={fetchFoods}
                onEdit={setEditingFood}
              />
            )}

          </div>

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="donor-footer">

          <div className="donor-footer-brand">

            <Leaf size={14} />

            <span>
              SharePlate
            </span>

          </div>

          <span>
            Making surplus food useful.
          </span>

        </footer>

      </div>

      {/* =================================================
          EDIT MODAL
          ================================================= */}

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onUpdated={fetchFoods}
        />
      )}

    </div>
  );
};

export default DonorDashboard;