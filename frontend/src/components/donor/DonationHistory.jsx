import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getDonationHistory, downloadCertificate } from "../../services/certificate.service";

const DonationHistory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getDonationHistory();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCertificate();
      toast.success("Certificate downloaded!");
    } catch (err) {
      toast.error("No completed donations to certify yet");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p>Loading donation history...</p>;
  if (!data) return null;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3>Your Impact</h3>
      <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#2e7d32" }}>
            {data.totalMeals}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>Meals Donated</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff8f00" }}>
            {data.totalDonations}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>Completed Donations</div>
        </div>
      </div>

      <button onClick={handleDownload} disabled={downloading || data.totalDonations === 0}>
        {downloading ? "Generating..." : "Download Impact Certificate (PDF)"}
      </button>
    </div>
  );
};

export default DonationHistory;