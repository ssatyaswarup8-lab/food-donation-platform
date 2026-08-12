import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "white", fontSize: "2.5rem", marginBottom: 10 }}>
          Turn Surplus Food Into Someone's Meal
        </h1>
        <p style={{ fontSize: "1.1rem", maxWidth: 600, margin: "0 auto 24px", opacity: 0.95 }}>
          Connecting restaurants, hotels, and canteens with NGOs and volunteers to fight hunger
          and reduce food waste — in real time.
        </p>
        <div>
          <Link to="/register">
            <button className="btn-accent" style={{ fontSize: 16, padding: "10px 24px" }}>
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button
              className="btn-outline"
              style={{ fontSize: 16, padding: "10px 24px", background: "white" }}
            >
              Login
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "40px 20px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <StatCard number="500+" label="Meals Saved" />
          <StatCard number="50+" label="Partner NGOs" />
          <StatCard number="100+" label="Active Volunteers" />
          <StatCard number="24/7" label="Live Tracking" />
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <StepCard emoji="🍲" title="Donor Posts Food" desc="Restaurants, hotels & canteens list surplus food with pickup details." />
          <StepCard emoji="🤝" title="NGO Claims It" desc="Nearby verified NGOs get notified instantly and claim what they need." />
          <StepCard emoji="🚴" title="Volunteer Delivers" desc="A nearby volunteer picks up and delivers — tracked live on a map." />
          <StepCard emoji="❤️" title="Meals Reach People" desc="Food reaches shelters, orphanages & families who need it most." />
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: "40px 20px", background: "var(--primary-green-light)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Join As</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <RoleCard emoji="🏨" title="Donor" desc="Restaurants, hotels, canteens, event organizers" />
          <RoleCard emoji="🏠" title="NGO" desc="Shelters, orphanages, old-age homes, charities" />
          <RoleCard emoji="🚴" title="Volunteer" desc="Help pick up and deliver food in your area" />
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h2>Ready to make a difference?</h2>
        <Link to="/register">
          <button className="btn-accent" style={{ fontSize: 16, padding: "10px 28px", marginTop: 10 }}>
            Join the Platform
          </button>
        </Link>
      </section>
    </div>
  );
};

const StatCard = ({ number, label }) => (
  <div>
    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary-green)" }}>
      {number}
    </div>
    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</div>
  </div>
);

const StepCard = ({ emoji, title, desc }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
    <h4 style={{ marginBottom: 6 }}>{title}</h4>
    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{desc}</p>
  </div>
);

const RoleCard = ({ emoji, title, desc }) => (
  <div className="card" style={{ width: 220, textAlign: "center" }}>
    <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
    <h4>{title}</h4>
    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{desc}</p>
  </div>
);

export default Home;