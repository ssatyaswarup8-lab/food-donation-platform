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
import { DailyLineChart, MonthlyBarChart, CategoryPieChart } from "../../components/admin/RechartsPanel";import DemandPredictionPanel from "../../components/admin/DemandPredictionPanel";
import FoodQualityReview from "../../components/admin/FoodQualityReview";
import AuditLogPanel from "../../components/admin/AuditLogPanel";
import ThemeToggle from "../../components/common/ThemeToggle";
import NotificationBell from "../../components/common/NotificationBell";


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, dailyRes, monthlyRes, categoryRes] = await Promise.all([
        getAnalyticsSummary(),
        getDailyDonations(),
        getMonthlyDonations(),
        getFoodCategoryBreakdown(),
      ]);

      setSummary(summaryRes.data);
      setDaily(dailyRes.data);
      setMonthly(monthlyRes.data);
      setCategories(categoryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") fetchAnalytics();
  }, [activeTab]);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <DashboardHeader
  icon="🛡️"
  title={`Welcome, ${user?.name}`}
  subtitle="Verify users, monitor deliveries, and track platform impact"
  gradient="linear-gradient(135deg, #6a1b9a, #4a148c)"
/>

<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
  <button onClick={logout}>Logout</button>
</div>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setActiveTab("overview")} disabled={activeTab === "overview"}>
          Overview
        </button>
        <button onClick={() => setActiveTab("users")} disabled={activeTab === "users"}>
          Users
        </button>
        <button onClick={() => setActiveTab("deliveries")} disabled={activeTab === "deliveries"}>
          Deliveries
        </button>
        <button onClick={() => setActiveTab("demand")} disabled={activeTab === "demand"}>
          Demand Prediction
        </button>
        <button onClick={() => setActiveTab("quality")} disabled={activeTab === "quality"}>
          Quality Review
        </button>
        <button onClick={() => setActiveTab("audit")} disabled={activeTab === "audit"}>
          Audit Log
        </button>
      </div>

      {activeTab === "overview" && (
        <div>
          {loading || !summary ? (
            <p>Loading analytics...</p>
          ) : (
            <>
             <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
  <StatBadge icon="🍲" label="Food Listings Posted" value={summary.totalFoodListingsPosted} />
  <StatBadge icon="🍛" label="Meals Distributed" value={summary.totalMealsDistributed} color="var(--accent-orange)" />
  <StatBadge icon="🏠" label="Active NGOs" value={summary.activeNGOs} />
  <StatBadge icon="🛵" label="Active Volunteers" value={summary.activeVolunteers} color="var(--accent-orange)" />
  <StatBadge icon="🏨" label="Active Donors" value={summary.activeDonors} />
  <StatBadge icon="✅" label="Deliveries Completed" value={summary.totalDeliveriesCompleted} />
  <StatBadge icon="⏳" label="Pending Verifications" value={summary.pendingVerifications} color={summary.pendingVerifications > 0 ? "var(--danger)" : "var(--primary-green)"} />
</div>
                <DailyLineChart data={daily} />
                <MonthlyBarChart data={monthly} />
                <CategoryPieChart data={categories} /> 
            </>
          )}
        </div>
      )}

      {activeTab === "users" && <UserVerificationTable />}
      {activeTab === "deliveries" && <DeliveryMonitor />}
      {activeTab === "demand" && <DemandPredictionPanel />}
      {activeTab === "quality" && <FoodQualityReview />}
      {activeTab === "audit" && <AuditLogPanel />}
    </div>
  );
};

const SummaryCard = ({ label, value, highlight }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 6,
      padding: 12,
      textAlign: "center",
      background: highlight ? "#fff3e0" : "white",
    }}
  >
    <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
    <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
  </div>
);

export default AdminDashboard;