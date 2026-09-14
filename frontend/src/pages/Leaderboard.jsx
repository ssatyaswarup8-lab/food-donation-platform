import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Utensils,
  Truck,
  Heart,
  TrendingUp,
  Award,
  Users,
  RefreshCw,
  Crown,
} from "lucide-react";

import {
  getTopDonors,
  getTopVolunteers,
  getTopNGOs,
} from "../services/leaderboard.service";

import { SkeletonCard } from "../components/common/Skeleton";
import "./Leaderboard.css";

const tabs = [
  {
    id: "donors",
    label: "Top Donors",
    icon: <Utensils size={18} />,
  },
  {
    id: "volunteers",
    label: "Top Volunteers",
    icon: <Truck size={18} />,
  },
  {
    id: "ngos",
    label: "Top NGOs",
    icon: <Heart size={18} />,
  },
];

const medals = ["🥇", "🥈", "🥉"];

const Leaderboard = () => {
  const [tab, setTab] = useState("donors");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let res;

      if (tab === "donors") {
        res = await getTopDonors();
      } else if (tab === "volunteers") {
        res = await getTopVolunteers();
      } else {
        res = await getTopNGOs();
      }

      setData(res?.data || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const getName = (item) => {
    if (tab === "donors") {
      return item?.donor?.organizationName || item?.donor?.name || "Anonymous Donor";
    }

    if (tab === "volunteers") {
      return item?.volunteer?.name || "Anonymous Volunteer";
    }

    return (
      item?.ngo?.organizationName ||
      item?.ngo?.name ||
      "Community NGO"
    );
  };

  const getMainValue = (item) => {
    if (tab === "donors") {
      return item?.totalMeals || 0;
    }

    if (tab === "volunteers") {
      return item?.totalDeliveries || 0;
    }

    return item?.totalMealsReceived || 0;
  };

  const getSecondaryValue = (item) => {
    if (tab === "donors") {
      return item?.totalDonations || 0;
    }

    if (tab === "volunteers") {
      return null;
    }

    return item?.totalClaims || 0;
  };

  const getMainLabel = () => {
    if (tab === "donors") return "meals rescued";
    if (tab === "volunteers") return "deliveries completed";
    return "meals received";
  };

  const getSecondaryLabel = () => {
    if (tab === "donors") return "donations";
    if (tab === "ngos") return "claims";
    return "";
  };

  const getInitials = (name) => {
    if (!name) return "SP";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getRankClass = (index) => {
    if (index === 0) return "rank-first";
    if (index === 1) return "rank-second";
    if (index === 2) return "rank-third";
    return "";
  };

  return (
    <div className="leaderboard-page">

      {/* HERO */}
      <section className="leaderboard-hero">
        <div className="leaderboard-container">

          <div className="leaderboard-hero-content">
            <div className="leaderboard-kicker">
              <span className="kicker-dot" />
              COMMUNITY IMPACT
            </div>

            <h1>
              People who make
              <br />
              <span>an impact.</span>
            </h1>

            <p>
              Every meal donated, every delivery completed and every
              organization supported helps build a better community.
            </p>
          </div>

          <div className="leaderboard-trophy">
            <div className="trophy-circle">
              <Trophy size={74} strokeWidth={1.4} />
            </div>

            <div className="trophy-ring ring-one" />
            <div className="trophy-ring ring-two" />

            <div className="floating-award award-one">
              <Medal size={18} />
            </div>

            <div className="floating-award award-two">
              <Heart size={17} />
            </div>

            <div className="floating-award award-three">
              <TrendingUp size={17} />
            </div>
          </div>

        </div>
      </section>

      {/* MAIN */}
      <main className="leaderboard-main">
        <div className="leaderboard-container">

          {/* TOP SUMMARY */}
          <div className="leaderboard-summary">

            <div className="summary-card">
              <div className="summary-icon">
                <Users size={20} />
              </div>

              <div>
                <span>COMMUNITY</span>
                <strong>500+</strong>
                <p>active members</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Utensils size={20} />
              </div>

              <div>
                <span>FOOD RESCUED</span>
                <strong>12.4K</strong>
                <p>meals and counting</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Heart size={20} />
              </div>

              <div>
                <span>COMMUNITY IMPACT</span>
                <strong>4.8K+</strong>
                <p>kg of food saved</p>
              </div>
            </div>

          </div>

          {/* LEADERBOARD CARD */}
          <section className="leaderboard-card">

            <div className="leaderboard-card-header">

              <div>
                <span className="section-label">TOP CONTRIBUTORS</span>

                <h2>
                  Community leaderboard
                </h2>

                <p>
                  Celebrating the people and organizations creating
                  meaningful change.
                </p>
              </div>

              <button
                type="button"
                className="refresh-button"
                onClick={() => fetchData(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "spin" : ""}
                />

                <span>
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

            </div>

            {/* TABS */}
            <div className="leaderboard-tabs">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`leaderboard-tab ${
                    tab === item.id ? "active" : ""
                  }`}
                  onClick={() => setTab(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* CONTENT */}
            {loading ? (
              <div className="leaderboard-loading">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : data.length === 0 ? (
              <div className="empty-leaderboard">

                <div className="empty-icon">
                  <Award size={30} />
                </div>

                <h3>No rankings yet</h3>

                <p>
                  Be the first to make an impact and appear on
                  the community leaderboard.
                </p>

                <button
                  type="button"
                  className="empty-refresh"
                  onClick={() => fetchData(true)}
                >
                  Refresh leaderboard
                </button>

              </div>
            ) : (
              <div className="leaderboard-content">

                {/* PODIUM */}
                {data.length >= 1 && (
                  <div className="podium">

                    {data[1] && (
                      <div className="podium-person second">

                        <div className="podium-avatar">
                          {getInitials(getName(data[1]))}
                        </div>

                        <div className="podium-medal">
                          🥈
                        </div>

                        <strong>
                          {getName(data[1])}
                        </strong>

                        <span>
                          {getMainValue(data[1])} {getMainLabel()}
                        </span>

                        <div className="podium-block">
                          <span>2</span>
                        </div>

                      </div>
                    )}

                    <div className="podium-person first">

                      <div className="crown">
                        <Crown size={20} />
                      </div>

                      <div className="podium-avatar">
                        {getInitials(getName(data[0]))}
                      </div>

                      <div className="podium-medal">
                        🥇
                      </div>

                      <strong>
                        {getName(data[0])}
                      </strong>

                      <span>
                        {getMainValue(data[0])} {getMainLabel()}
                      </span>

                      <div className="podium-block">
                        <span>1</span>
                      </div>

                    </div>

                    {data[2] && (
                      <div className="podium-person third">

                        <div className="podium-avatar">
                          {getInitials(getName(data[2]))}
                        </div>

                        <div className="podium-medal">
                          🥉
                        </div>

                        <strong>
                          {getName(data[2])}
                        </strong>

                        <span>
                          {getMainValue(data[2])} {getMainLabel()}
                        </span>

                        <div className="podium-block">
                          <span>3</span>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* TABLE */}
                <div className="ranking-list">

                  <div className="ranking-header">
                    <span>RANK</span>
                    <span>MEMBER</span>
                    <span>{getMainLabel().toUpperCase()}</span>

                    {tab !== "volunteers" && (
                      <span>{getSecondaryLabel().toUpperCase()}</span>
                    )}
                  </div>

                  {data.map((item, index) => {
                    const name = getName(item);
                    const mainValue = getMainValue(item);
                    const secondaryValue = getSecondaryValue(item);

                    return (
                      <div
                        className={`ranking-row ${getRankClass(index)}`}
                        key={item._id || `${name}-${index}`}
                      >

                        {/* RANK */}
                        <div className="ranking-position">

                          {index < 3 ? (
                            <span className="ranking-medal">
                              {medals[index]}
                            </span>
                          ) : (
                            <span className="rank-number">
                              #{index + 1}
                            </span>
                          )}

                        </div>

                        {/* MEMBER */}
                        <div className="ranking-member">

                          <div className="member-avatar">
                            {getInitials(name)}
                          </div>

                          <div>
                            <strong>{name}</strong>

                            <span>
                              {tab === "donors"
                                ? "Food donor"
                                : tab === "volunteers"
                                ? "Community volunteer"
                                : "Partner NGO"}
                            </span>
                          </div>

                        </div>

                        {/* MAIN VALUE */}
                        <div className="ranking-value">

                          <strong>
                            {mainValue.toLocaleString()}
                          </strong>

                          <span>
                            {getMainLabel()}
                          </span>

                        </div>

                        {/* SECONDARY VALUE */}
                        {tab !== "volunteers" && (
                          <div className="ranking-secondary">

                            <strong>
                              {secondaryValue?.toLocaleString() || 0}
                            </strong>

                            <span>
                              {getSecondaryLabel()}
                            </span>

                          </div>
                        )}

                        {/* IMPACT */}
                        <div className="impact-badge">
                          <TrendingUp size={14} />
                          Impact
                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>
            )}

          </section>

          {/* BOTTOM MESSAGE */}
          <div className="leaderboard-footer-message">

            <div className="footer-message-icon">
              <Heart size={20} />
            </div>

            <div>
              <strong>
                Your impact starts with one action.
              </strong>

              <p>
                Donate food, volunteer for a pickup, or help an
                organization receive meals.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Leaderboard;