import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  getAnalyticsSummary,
  getDailyDonations,
  getMonthlyDonations,
  getFoodCategoryBreakdown,
} from "../../services/admin.service";
import UserVerificationTable from "../../components/admin/UserVerificationTable";
import DeliveryMonitor from "../../components/admin/DeliveryMonitor";
import AnalyticsChart from "../../components/admin/AnalyticsChart";
import DemandPredictionPanel from "../../components/admin/DemandPredictionPanel";
import FoodQualityReview from "../../components/admin/FoodQualityReview";


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
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin Dashboard</h2>
        <div>
          <span>Welcome, {user?.name} </span>
          <button onClick={logout}>Logout</button>
        </div>
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
      </div>

      {activeTab === "overview" && (
        <div>
          {loading || !summary ? (
            <p>Loading analytics...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <SummaryCard label="Food Listings Posted" value={summary.totalFoodListingsPosted} />
                <SummaryCard label="Meals Distributed" value={summary.totalMealsDistributed} />
                <SummaryCard label="Active NGOs" value={summary.activeNGOs} />
                <SummaryCard label="Active Volunteers" value={summary.activeVolunteers} />
                <SummaryCard label="Active Donors" value={summary.activeDonors} />
                <SummaryCard label="Deliveries Completed" value={summary.totalDeliveriesCompleted} />
                <SummaryCard
                  label="Pending Verifications"
                  value={summary.pendingVerifications}
                  highlight={summary.pendingVerifications > 0}
                />
              </div>

              <AnalyticsChart
                title="Daily Donations (last 30 days)"
                data={daily}
                labelKey="_id"
                valueKey="totalListings"
              />
              <AnalyticsChart
                title="Monthly Donations (last 12 months)"
                data={monthly}
                labelKey="_id"
                valueKey="totalListings"
              />
              <AnalyticsChart
                title="Food Category Breakdown"
                data={categories}
                labelKey="_id"
                valueKey="count"
              />
            </>
          )}
        </div>
      )}

      {activeTab === "users" && <UserVerificationTable />}
      {activeTab === "deliveries" && <DeliveryMonitor />}
      {activeTab === "demand" && <DemandPredictionPanel />}
      {activeTab === "quality" && <FoodQualityReview />}
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