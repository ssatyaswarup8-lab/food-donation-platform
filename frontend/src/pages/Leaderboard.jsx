import { useState, useEffect } from "react";
import { getTopDonors, getTopVolunteers, getTopNGOs } from "../services/leaderboard.service";
import { SkeletonCard } from "../components/common/Skeleton";

const medals = ["🥇", "🥈", "🥉"];

const Leaderboard = () => {
  const [tab, setTab] = useState("donors");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === "donors") res = await getTopDonors();
      else if (tab === "volunteers") res = await getTopVolunteers();
      else res = await getTopNGOs();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const renderRow = (item, idx) => {
    const rank = idx < 3 ? medals[idx] : `#${idx + 1}`;

    if (tab === "donors") {
      return (
        <tr key={item._id}>
          <td>{rank}</td>
          <td>{item.donor.organizationName || item.donor.name}</td>
          <td>{item.totalMeals}</td>
          <td>{item.totalDonations}</td>
        </tr>
      );
    }
    if (tab === "volunteers") {
      return (
        <tr key={item._id}>
          <td>{rank}</td>
          <td>{item.volunteer.name}</td>
          <td>{item.totalDeliveries}</td>
        </tr>
      );
    }
    return (
      <tr key={item._id}>
        <td>{rank}</td>
        <td>{item.ngo.organizationName || item.ngo.name}</td>
        <td>{item.totalMealsReceived}</td>
        <td>{item.totalClaims}</td>
      </tr>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h2>🏆 Leaderboard</h2>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setTab("donors")} disabled={tab === "donors"}>
          Top Donors
        </button>
        <button onClick={() => setTab("volunteers")} disabled={tab === "volunteers"}>
          Top Volunteers
        </button>
        <button onClick={() => setTab("ngos")} disabled={tab === "ngos"}>
          Top NGOs
        </button>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : data.length === 0 ? (
        <p>No data yet — be the first to make an impact!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              {tab === "donors" && (
                <>
                  <th>Meals</th>
                  <th>Donations</th>
                </>
              )}
              {tab === "volunteers" && <th>Deliveries</th>}
              {tab === "ngos" && (
                <>
                  <th>Meals Received</th>
                  <th>Claims</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>{data.map(renderRow)}</tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;