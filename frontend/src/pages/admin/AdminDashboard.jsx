import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

import DashboardHeader from "../../components/common/DashboardHeader";
import StatBadge from "../../components/common/StatBadge";

import {
  getAnalyticsSummary,
  getDailyDonations,
  getMonthlyDonations,
  getFoodCategoryBreakdown,
} from "../../services/admin.service";

import UserVerificationTable from "../../components/admin/UserVerificationTable";
import DeliveryMonitor from "../../components/admin/DeliveryMonitor";

import {
  DailyLineChart,
  MonthlyBarChart,
  CategoryPieChart,
} from "../../components/admin/RechartsPanel";

import DemandPredictionPanel from "../../components/admin/DemandPredictionPanel";
import FoodQualityReview from "../../components/admin/FoodQualityReview";
import AuditLogPanel from "../../components/admin/AuditLogPanel";

import ThemeToggle from "../../components/common/ThemeToggle";
import NotificationBell from "../../components/common/NotificationBell";

import {
  LayoutDashboard,
  Users,
  Truck,
  BrainCircuit,
  ShieldCheck,
  ClipboardList,
  RefreshCw,
  LogOut,
  TrendingUp,
  AlertTriangle,
  Utensils,
  Building2,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import "./AdminDashboard.css";

const navigation = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={17} />,
  },
  {
    id: "users",
    label: "Users",
    icon: <Users size={17} />,
  },
  {
    id: "deliveries",
    label: "Deliveries",
    icon: <Truck size={17} />,
  },
  {
    id: "demand",
    label: "Demand Prediction",
    icon: <BrainCircuit size={17} />,
  },
  {
    id: "quality",
    label: "Quality Review",
    icon: <ShieldCheck size={17} />,
  },
  {
    id: "audit",
    label: "Audit Log",
    icon: <ClipboardList size={17} />,
  },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (manualRefresh = false) => {
    if (manualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        summaryRes,
        dailyRes,
        monthlyRes,
        categoryRes,
      ] = await Promise.all([
        getAnalyticsSummary(),
        getDailyDonations(),
        getMonthlyDonations(),
        getFoodCategoryBreakdown(),
      ]);

      setSummary(summaryRes.data);
      setDaily(dailyRes.data || []);
      setMonthly(monthlyRes.data || []);
      setCategories(categoryRes.data || []);
    } catch (err) {
      console.error("Admin analytics error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchAnalytics();
    }
  }, [activeTab]);

  const pendingVerifications =
    summary?.pendingVerifications || 0;

  return (
    <div className="admin-page">

      <div className="admin-background" />

      <div className="admin-layout">

        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="admin-sidebar">

          <div className="admin-brand">

            <div className="admin-brand-mark">
              🛡️
            </div>

            <div>
              <strong>SharePlate</strong>
              <span>Admin Console</span>
            </div>

          </div>

          <div className="admin-sidebar-label">
            MANAGEMENT
          </div>

          <nav className="admin-navigation">

            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${
                  activeTab === item.id ? "active" : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="admin-nav-icon">
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {item.id === "users" &&
                  pendingVerifications > 0 && (
                    <span className="nav-alert">
                      {pendingVerifications}
                    </span>
                  )}
              </button>
            ))}

          </nav>

          <div className="sidebar-bottom">

            <div className="admin-user-mini">

              <div className="admin-user-avatar">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "A"}
              </div>

              <div>
                <strong>
                  {user?.name || "Administrator"}
                </strong>

                <span>Platform Admin</span>
              </div>

            </div>

            <button
              type="button"
              className="admin-logout"
              onClick={logout}
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

        </aside>

        {/* =================================================
            MAIN CONTENT
            ================================================= */}

        <main className="admin-main">

          {/* TOPBAR */}

          <header className="admin-topbar">

            <div className="admin-breadcrumb">
              <span>ADMIN</span>
              <span>/</span>
              <strong>
                {navigation.find(
                  (item) => item.id === activeTab
                )?.label}
              </strong>
            </div>

            <div className="admin-top-actions">

              <ThemeToggle />

              <NotificationBell />

              <div className="admin-top-user">
                <div>
                  <strong>
                    {user?.name || "Administrator"}
                  </strong>

                  <span>Admin</span>
                </div>

                <div className="admin-top-avatar">
                  {user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}
                </div>
              </div>

            </div>

          </header>

          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <section className="admin-page-header">

            <div>

              <span className="admin-kicker">
                PLATFORM CONTROL CENTER
              </span>

              <h1>
                {activeTab === "overview"
                  ? "Good to see you,"
                  : navigation.find(
                      (item) => item.id === activeTab
                    )?.label}
                {activeTab === "overview" && (
                  <>
                    <br />
                    <span>{user?.name || "Admin"}.</span>
                  </>
                )}
              </h1>

              <p>
                {activeTab === "overview"
                  ? "Monitor food rescue activity, community growth, and platform health."
                  : `Manage and monitor SharePlate ${navigation
                      .find(
                        (item) => item.id === activeTab
                      )
                      ?.label.toLowerCase()}.`}
              </p>

            </div>

            {activeTab === "overview" && (
              <button
                type="button"
                className="admin-refresh-button"
                onClick={() => fetchAnalytics(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "admin-refresh-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Updating..."
                  : "Refresh data"}
              </button>
            )}

          </section>

          {/* =================================================
              OVERVIEW
              ================================================= */}

          {activeTab === "overview" && (
            <Overview
              summary={summary}
              daily={daily}
              monthly={monthly}
              categories={categories}
              loading={loading}
              pendingVerifications={pendingVerifications}
              onUsers={() => setActiveTab("users")}
            />
          )}

          {/* =================================================
              USERS
              ================================================= */}

          {activeTab === "users" && (
            <div className="admin-component-card">
              <UserVerificationTable />
            </div>
          )}

          {/* =================================================
              DELIVERIES
              ================================================= */}

          {activeTab === "deliveries" && (
            <div className="admin-component-card">
              <DeliveryMonitor />
            </div>
          )}

          {/* =================================================
              DEMAND
              ================================================= */}

          {activeTab === "demand" && (
            <div className="admin-component-card">
              <DemandPredictionPanel />
            </div>
          )}

          {/* =================================================
              QUALITY
              ================================================= */}

          {activeTab === "quality" && (
            <div className="admin-component-card">
              <FoodQualityReview />
            </div>
          )}

          {/* =================================================
              AUDIT
              ================================================= */}

          {activeTab === "audit" && (
            <div className="admin-component-card">
              <AuditLogPanel />
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

/* =========================================================
   OVERVIEW
   ========================================================= */

const Overview = ({
  summary,
  daily,
  monthly,
  categories,
  loading,
  pendingVerifications,
  onUsers,
}) => {
  if (loading || !summary) {
    return (
      <div className="admin-loading">

        <div className="admin-loader" />

        <h2>Loading platform analytics</h2>

        <p>
          Gathering the latest SharePlate activity...
        </p>

      </div>
    );
  }

  return (
    <div className="admin-overview">

      {/* =================================================
          ALERT
          ================================================= */}

      {pendingVerifications > 0 && (
        <button
          type="button"
          className="admin-alert-banner"
          onClick={onUsers}
        >
          <div className="alert-icon">
            <AlertTriangle size={19} />
          </div>

          <div>
            <strong>
              {pendingVerifications} verification
              {pendingVerifications !== 1
                ? "s"
                : ""}{" "}
              waiting for review
            </strong>

            <span>
              Review pending users before they can
              access all platform features.
            </span>
          </div>

          <span className="alert-action">
            Review now →
          </span>
        </button>
      )}

      {/* =================================================
          KPI GRID
          ================================================= */}

      <div className="admin-stat-grid">

        <AdminStat
          icon={<Utensils size={19} />}
          label="Food Listings"
          value={summary.totalFoodListingsPosted}
          description="Total listings posted"
        />

        <AdminStat
          icon={<TrendingUp size={19} />}
          label="Meals Distributed"
          value={summary.totalMealsDistributed}
          description="Meals reaching communities"
          featured
        />

        <AdminStat
          icon={<Building2 size={19} />}
          label="Active NGOs"
          value={summary.activeNGOs}
          description="Verified organizations"
        />

        <AdminStat
          icon={<UserRound size={19} />}
          label="Active Volunteers"
          value={summary.activeVolunteers}
          description="People helping deliveries"
        />

        <AdminStat
          icon={<Utensils size={19} />}
          label="Active Donors"
          value={summary.activeDonors}
          description="Community food donors"
        />

        <AdminStat
          icon={<Truck size={19} />}
          label="Deliveries Completed"
          value={summary.totalDeliveriesCompleted}
          description="Successful deliveries"
        />

      </div>

      {/* =================================================
          SECONDARY STATS
          ================================================= */}

      <div className="admin-secondary-row">

        <div className="admin-secondary-card">

          <div className="secondary-icon">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <span>DELIVERY SUCCESS</span>
            <strong>
              {summary.totalDeliveriesCompleted || 0}
            </strong>
            <p>completed deliveries</p>
          </div>

        </div>

        <div
          className={`admin-secondary-card ${
            pendingVerifications > 0
              ? "warning-card"
              : ""
          }`}
        >

          <div className="secondary-icon">
            <AlertTriangle size={17} />
          </div>

          <div>
            <span>PENDING REVIEW</span>
            <strong>
              {pendingVerifications}
            </strong>
            <p>user verifications</p>
          </div>

        </div>

        <div className="admin-secondary-card">

          <div className="secondary-icon">
            <Users size={17} />
          </div>

          <div>
            <span>COMMUNITY</span>
            <strong>
              {(summary.activeNGOs || 0) +
                (summary.activeVolunteers || 0) +
                (summary.activeDonors || 0)}
            </strong>
            <p>active participants</p>
          </div>

        </div>

      </div>

      {/* =================================================
          CHARTS
          ================================================= */}

      <div className="admin-chart-grid">

        <div className="admin-chart-card wide-chart">
          <DailyLineChart data={daily} />
        </div>

        <div className="admin-chart-card">
          <CategoryPieChart data={categories} />
        </div>

      </div>

      <div className="admin-chart-card monthly-chart">
        <MonthlyBarChart data={monthly} />
      </div>

      {/* =================================================
          PLATFORM HEALTH
          ================================================= */}

      <div className="admin-health-card">

        <div>

          <span className="admin-kicker">
            PLATFORM HEALTH
          </span>

          <h2>
            SharePlate is moving food where it matters.
          </h2>

          <p>
            Keep monitoring donations, deliveries,
            verification activity and food quality to
            maintain a reliable community network.
          </p>

        </div>

        <div className="health-status">
          <span />
          Operational
        </div>

      </div>

    </div>
  );
};

/* =========================================================
   STAT CARD
   ========================================================= */

const AdminStat = ({
  icon,
  label,
  value,
  description,
  featured = false,
}) => {
  return (
    <div
      className={`admin-stat-card ${
        featured ? "featured" : ""
      }`}
    >

      <div className="admin-stat-top">

        <div className="admin-stat-icon">
          {icon}
        </div>

        <span className="stat-trend">
          Live
        </span>

      </div>

      <div className="admin-stat-value">
        {Number(value || 0).toLocaleString()}
      </div>

      <div className="admin-stat-label">
        {label}
      </div>

      <p>{description}</p>

    </div>
  );
};

export default AdminDashboard;