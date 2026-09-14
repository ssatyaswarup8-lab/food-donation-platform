import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";
import "./Home.css";

const donations = [
  {
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80",
    title: "Fresh Vegetable Meals",
    donor: "Green Leaf Kitchen",
    quantity: "35 meals",
    distance: "1.4 km",
    time: "Pickup before 9:30 PM",
    type: "Vegetarian",
  },
  {
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=700&q=80",
    title: "Rice, Dal & Curry",
    donor: "The Courtyard",
    quantity: "52 meals",
    distance: "2.1 km",
    time: "Pickup before 10:15 PM",
    type: "Vegetarian",
  },
  {
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=80",
    title: "Fresh Bakery Items",
    donor: "Morning Bakehouse",
    quantity: "28 packs",
    distance: "3.6 km",
    time: "Pickup before 8:45 PM",
    type: "Bakery",
  },
];

const partners = [
  "Green Leaf Kitchen",
  "The Courtyard",
  "CityCare Foundation",
  "Hope Shelter",
  "Morning Bakehouse",
];

const Home = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="home-header">
        <div className="home-container nav-container">
          <Link to="/" className="brand" onClick={closeMobileMenu}>
            <span className="brand-mark">
              <Leaf size={20} strokeWidth={2.5} />
            </span>

            <span className="brand-name">
              Share<span>Plate</span>
            </span>
          </Link>

          <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
            <a href="#how-it-works" onClick={closeMobileMenu}>
              How it works
            </a>

            <a href="#donations" onClick={closeMobileMenu}>
              Find food
            </a>

            <a href="#impact" onClick={closeMobileMenu}>
              Our impact
            </a>

            <a href="#partners" onClick={closeMobileMenu}>
              Partners
            </a>

            <div className="mobile-nav-actions">
              <Link to="/login" className="nav-login">
                Login
              </Link>

              <Link to="/register" className="nav-donate">
                Get started
                <ArrowRight size={15} />
              </Link>
            </div>
          </nav>

          <div className="desktop-nav-actions">
            <Link to="/login" className="nav-login">
              Login
            </Link>

            <Link to="/register" className="nav-donate">
              Get started
              <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenu((value) => !value)}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-noise" />

          <div className="home-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                Food rescue, made local
              </div>

              <h1>
                Good food
                <br />
                deserves a
                <br />
                <em>second plate.</em>
              </h1>

              <p className="hero-description">
                We connect surplus food from restaurants, hotels and events
                with verified organizations and volunteers who can get it to
                people who need it.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="primary-button">
                  Donate food
                  <ArrowUpRight size={17} />
                </Link>

                <a href="#how-it-works" className="secondary-button">
                  <span className="play-icon">
                    <Play size={12} fill="currentColor" />
                  </span>
                  See how it works
                </a>
              </div>

              <div className="hero-trust">
                <div className="avatar-stack">
                  <div className="avatar avatar-one">A</div>
                  <div className="avatar avatar-two">R</div>
                  <div className="avatar avatar-three">S</div>
                  <div className="avatar avatar-four">M</div>
                </div>

                <div className="trust-copy">
                  <div className="stars">★★★★★</div>
                  <span>
                    Trusted by <strong>500+ community members</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="hero-visual">
              <div className="hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1200&q=85"
                  alt="Volunteers distributing food"
                />

                <div className="image-overlay" />

                <div className="live-badge">
                  <span className="live-pulse" />
                  Live food rescue
                </div>

                <div className="rescue-card">
                  <div className="rescue-card-top">
                    <div className="rescue-icon">
                      <PackageCheck size={17} />
                    </div>

                    <div>
                      <span className="small-label">RESCUED TODAY</span>
                      <strong>1,284 meals</strong>
                    </div>

                    <div className="trend">
                      +18%
                      <ArrowUpRight size={12} />
                    </div>
                  </div>

                  <div className="progress-track">
                    <div className="progress-value" />
                  </div>

                  <div className="rescue-footer">
                    <span>Goal: 1,500 meals</span>
                    <span>86%</span>
                  </div>
                </div>

                <div className="location-floating-card">
                  <div className="location-icon">
                    <MapPin size={16} />
                  </div>

                  <div>
                    <strong>12 active pickups</strong>
                    <span>near you right now</span>
                  </div>

                  <span className="green-status" />
                </div>
              </div>

              <div className="hero-circle-decoration" />
            </div>
          </div>

          <div className="hero-bottom home-container">
            <span>Making surplus food useful across communities</span>

            <div className="hero-bottom-line" />

            <span className="scroll-label">
              Scroll to explore
              <ChevronRight size={14} />
            </span>
          </div>
        </section>

        {/* PARTNERS */}
        <section className="partner-strip" id="partners">
          <div className="home-container">
            <p>Already helping local communities with</p>

            <div className="partner-list">
              {partners.map((partner, index) => (
                <span key={partner}>
                  <span className="partner-symbol">
                    {index % 2 === 0 ? "✦" : "●"}
                  </span>
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section className="impact-section" id="impact">
          <div className="home-container">
            <div className="section-heading impact-heading">
              <div>
                <span className="section-kicker">THE NUMBERS</span>

                <h2>
                  Small actions.
                  <br />
                  <span>Real impact.</span>
                </h2>
              </div>

              <p>
                Every meal rescued is one less meal wasted and one more
                opportunity to support someone in our community.
              </p>
            </div>

            <div className="impact-grid">
              <ImpactNumber
                number="12.4K"
                label="Meals rescued"
                icon={<Utensils size={19} />}
              />

              <ImpactNumber
                number="4.8K"
                label="Kg of food saved"
                icon={<Leaf size={19} />}
              />

              <ImpactNumber
                number="530+"
                label="Active donors"
                icon={<Heart size={19} />}
              />

              <ImpactNumber
                number="180+"
                label="Volunteers"
                icon={<Users size={19} />}
              />
            </div>
          </div>
        </section>

        {/* DONATIONS */}
        <section className="donations-section" id="donations">
          <div className="home-container">
            <div className="section-top-row">
              <div>
                <span className="section-kicker">AVAILABLE NOW</span>

                <h2>
                  Food waiting
                  <br />
                  <span>for a home.</span>
                </h2>
              </div>

              <Link to="/donations" className="text-link">
                Explore all donations
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="donation-layout">
              <div className="donation-map">
                <div className="map-grid" />

                <div className="map-road road-one" />
                <div className="map-road road-two" />
                <div className="map-road road-three" />

                <div className="map-area-label area-one">
                  Saheed Nagar
                </div>

                <div className="map-area-label area-two">
                  Unit 4
                </div>

                <div className="map-area-label area-three">
                  Jayadev Vihar
                </div>

                <MapPin
                  className="map-pin pin-one"
                  size={24}
                  fill="currentColor"
                />

                <MapPin
                  className="map-pin pin-two"
                  size={24}
                  fill="currentColor"
                />

                <MapPin
                  className="map-pin pin-three"
                  size={24}
                  fill="currentColor"
                />

                <div className="user-location">
                  <span />
                </div>

                <div className="map-control">
                  <Navigation size={14} />
                  <span>Near you</span>
                </div>

                <div className="map-caption">
                  <strong>18 donations</strong>
                  <span>available within 5 km</span>
                </div>
              </div>

              <div className="donation-cards">
                {donations.map((donation, index) => (
                  <DonationCard
                    key={donation.title}
                    donation={donation}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="process-section" id="how-it-works">
          <div className="home-container">
            <div className="section-heading centered-heading">
              <span className="section-kicker">HOW IT WORKS</span>

              <h2>
                From excess
                <br />
                <span>to impact.</span>
              </h2>

              <p>
                A simple process designed to make food rescue fast,
                transparent and reliable.
              </p>
            </div>

            <div className="process-grid">
              <ProcessStep
                number="01"
                icon={<Utensils size={23} />}
                title="List surplus food"
                description="Tell us what food you have, how much is available and when it can be collected."
              />

              <ProcessStep
                number="02"
                icon={<ShieldCheck size={23} />}
                title="A verified NGO claims it"
                description="Nearby organizations see your donation and claim it based on their current needs."
              />

              <ProcessStep
                number="03"
                icon={<Truck size={23} />}
                title="Volunteer picks it up"
                description="A nearby volunteer receives the pickup request and coordinates the collection."
              />

              <ProcessStep
                number="04"
                icon={<Heart size={23} />}
                title="Someone gets a meal"
                description="The food reaches a shelter, community center or family that needs it."
              />
            </div>

            <div className="process-note">
              <Sparkles size={16} />

              <span>
                <strong>Built for speed.</strong> Most donations are matched
                with a nearby organization within minutes.
              </span>
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section className="roles-section">
          <div className="home-container">
            <div className="roles-intro">
              <div>
                <span className="section-kicker">ONE PLATFORM</span>

                <h2>
                  Everyone has
                  <br />
                  <span>a part to play.</span>
                </h2>
              </div>

              <p>
                Whether you have food to share, people to support, or a few
                hours to give — there is a place for you here.
              </p>
            </div>

            <div className="role-grid">
              <RoleCard
                number="01"
                title="Donors"
                subtitle="Restaurants · Hotels · Events"
                description="Turn today's surplus into tomorrow's impact."
                icon={<Utensils size={23} />}
                link="/register"
              />

              <RoleCard
                number="02"
                title="NGOs"
                subtitle="Shelters · Charities · Communities"
                description="Find reliable food donations for the people you serve."
                icon={<Heart size={23} />}
                link="/register"
              />

              <RoleCard
                number="03"
                title="Volunteers"
                subtitle="Drivers · Students · Helpers"
                description="Use your time and skills to move food where it matters."
                icon={<Truck size={23} />}
                link="/register"
              />
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="story-section">
          <div className="home-container story-grid">
            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=1000&q=85"
                alt="Community volunteers sharing food"
              />

              <div className="story-image-note">
                <span className="story-note-icon">
                  <Heart size={16} fill="currentColor" />
                </span>

                <div>
                  <strong>One meal matters.</strong>
                  <span>And so does every person behind it.</span>
                </div>
              </div>
            </div>

            <div className="story-copy">
              <span className="section-kicker">WHY SHAREPLATE</span>

              <h2>
                Food waste is a
                <br />
                <span>logistics problem.</span>
              </h2>

              <p>
                Every day, perfectly good food is thrown away while people in
                the same city struggle to access a meal.
              </p>

              <p>
                SharePlate brings donors, NGOs and volunteers together in one
                place — so surplus food can move quickly to where it is
                needed.
              </p>

              <ul className="story-list">
                <li>
                  <span>
                    <Check size={12} />
                  </span>
                  Verified organizations
                </li>

                <li>
                  <span>
                    <Check size={12} />
                  </span>
                  Real-time pickup coordination
                </li>

                <li>
                  <span>
                    <Check size={12} />
                  </span>
                  Transparent donation tracking
                </li>

                <li>
                  <span>
                    <Check size={12} />
                  </span>
                  Measurable social impact
                </li>
              </ul>

              <Link to="/register" className="outline-button">
                Become part of it
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="testimonial-section">
          <div className="home-container">
            <div className="testimonial-card">
              <div className="quote-mark">“</div>

              <blockquote>
                We used to have no reliable way to handle the food left after
                large events. Now we can post it, see who claimed it and know
                that it reached people instead of a landfill.
              </blockquote>

              <div className="testimonial-person">
                <div className="person-avatar">SM</div>

                <div>
                  <strong>Shreya Mishra</strong>
                  <span>Community coordinator · Bhubaneswar</span>
                </div>
              </div>

              <div className="testimonial-decoration" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="cta-leaf cta-leaf-one">
            <Leaf size={90} />
          </div>

          <div className="cta-leaf cta-leaf-two">
            <Leaf size={65} />
          </div>

          <div className="home-container cta-content">
            <span className="section-kicker light-kicker">START TODAY</span>

            <h2>
              Have food to spare?
              <br />
              <em>Someone needs it.</em>
            </h2>

            <p>
              Join a growing community turning surplus food into something
              useful, every single day.
            </p>

            <div className="cta-actions">
              <Link to="/register" className="cta-primary">
                Get started
                <ArrowUpRight size={18} />
              </Link>

              <Link to="/login" className="cta-secondary">
                Already a member? Log in
              </Link>
            </div>

            <div className="cta-contact">
              <Phone size={14} />
              <span>Questions? Our community team is here to help.</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-container footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-mark">
                <Leaf size={19} />
              </span>

              <span className="brand-name">
                Share<span>Plate</span>
              </span>
            </Link>

            <p>
              Making surplus food useful.
              <br />
              One community at a time.
            </p>
          </div>

          <div className="footer-columns">
            <FooterColumn
              title="Platform"
              links={[
                ["Find food", "/donations"],
                ["Donate food", "/register"],
                ["Organizations", "/organizations"],
                ["Volunteers", "/register"],
              ]}
            />

            <FooterColumn
              title="Company"
              links={[
                ["About us", "/about"],
                ["Our impact", "/impact"],
                ["Contact", "/contact"],
                ["FAQ", "/faq"],
              ]}
            />

            <FooterColumn
              title="Account"
              links={[
                ["Login", "/login"],
                ["Create account", "/register"],
                ["Dashboard", "/dashboard"],
              ]}
            />
          </div>
        </div>

        <div className="home-container footer-bottom">
          <span>© 2026 SharePlate. Built for better communities.</span>

          <div>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ImpactNumber = ({ number, label, icon }) => {
  return (
    <div className="impact-item">
      <div className="impact-icon">{icon}</div>
      <div className="impact-number">{number}</div>
      <div className="impact-label">{label}</div>
    </div>
  );
};

const DonationCard = ({ donation, index }) => {
  return (
    <article className="donation-card">
      <div className="donation-image">
        <img src={donation.image} alt={donation.title} />

        <span className="food-type">{donation.type}</span>

        {index === 0 && (
          <span className="fresh-badge">
            <span />
            Fresh
          </span>
        )}
      </div>

      <div className="donation-content">
        <div className="donation-heading">
          <div>
            <h3>{donation.title}</h3>
            <span className="donor-name">{donation.donor}</span>
          </div>

          <button
            type="button"
            className="save-button"
            aria-label="Save donation"
          >
            <Heart size={16} />
          </button>
        </div>

        <div className="donation-meta">
          <span>
            <Utensils size={13} />
            {donation.quantity}
          </span>

          <span>
            <MapPin size={13} />
            {donation.distance}
          </span>
        </div>

        <div className="donation-time">
          <Clock3 size={13} />
          {donation.time}
        </div>

        <Link to="/login" className="claim-button">
          View donation
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

const ProcessStep = ({ number, icon, title, description }) => {
  return (
    <div className="process-step">
      <div className="step-top">
        <span className="step-number">{number}</span>
        <div className="step-icon">{icon}</div>
      </div>

      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const RoleCard = ({
  number,
  title,
  subtitle,
  description,
  icon,
  link,
}) => {
  return (
    <Link to={link} className="role-card">
      <div className="role-card-top">
        <span>{number}</span>

        <div className="role-icon">{icon}</div>

        <ArrowUpRight className="role-arrow" size={19} />
      </div>

      <div className="role-content">
        <span className="role-subtitle">{subtitle}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="role-line" />
    </Link>
  );
};

const FooterColumn = ({ title, links }) => {
  return (
    <div className="footer-column">
      <h4>{title}</h4>

      {links.map(([label, url]) => (
        <Link key={label} to={url}>
          {label}
        </Link>
      ))}
    </div>
  );
};

export default Home;