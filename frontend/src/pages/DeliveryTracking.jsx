import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  RefreshCw,
  Truck,
  UserRound,
  Utensils,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

import { getDeliveryById } from "../services/delivery.service";
import LiveTrackingMap from "../components/map/LiveTrackingMap";
import ChatBox from "../components/common/ChatBox";
import DeliveryStatusTimeline from "../components/tracking/DeliveryStatusTimeline";

import "./DeliveryTracking.css";

const statusText = {
  pending_assignment: "Looking for a nearby volunteer...",
  assigned: "Volunteer is heading to pickup",
  picked_up: "Food picked up — on the way to you",
  delivered: "Delivered! Awaiting confirmation",
  completed: "Delivery completed",
};

const statusLabels = {
  pending_assignment: "Finding volunteer",
  assigned: "Volunteer assigned",
  picked_up: "Food picked up",
  delivered: "Arriving",
  completed: "Completed",
};

const DeliveryTracking = () => {
  const { id } = useParams();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDelivery = async (manualRefresh = false) => {
    if (manualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getDeliveryById(id);
      setDelivery(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load delivery"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDelivery();

    const interval = setInterval(() => {
      fetchDelivery();
    }, 15000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <div className="tracking-loading">

            <div className="loading-spinner" />

            <h2>Loading delivery</h2>

            <p>
              Getting the latest information about your
              food delivery...
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">

          <div className="tracking-error">

            <div className="error-icon">
              <MapPin size={30} />
            </div>

            <span className="error-code">
              DELIVERY UNAVAILABLE
            </span>

            <h2>
              We couldn't load
              <br />
              <span>this delivery.</span>
            </h2>

            <p>{error}</p>

            <div className="error-actions">

              <button
                type="button"
                onClick={() => fetchDelivery(true)}
                className="retry-button"
              >
                <RefreshCw size={16} />
                Try again
              </button>

              <Link
                to="/"
                className="tracking-home-button"
              >
                Back to home
              </Link>

            </div>

          </div>

        </div>
      </div>
    );
  }

  if (!delivery) return null;

  const currentStatus =
    delivery.status || "pending_assignment";

  const foodName =
    delivery.foodId?.foodName || "Food donation";

  const volunteer = delivery.volunteerId;

  return (
    <div className="tracking-page">

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="tracking-background" />

      <div className="tracking-container">

        {/* =================================================
            TOP NAV
            ================================================= */}

        <div className="tracking-topbar">

          <Link
            to="/"
            className="tracking-back-link"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="tracking-live-status">
            <span className="live-dot" />
            Live tracking
          </div>

        </div>

        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <section className="tracking-header">

          <div>

            <span className="tracking-kicker">
              DELIVERY TRACKING
            </span>

            <h1>
              Your food is
              <br />
              <span>on its way.</span>
            </h1>

            <p>
              Follow the delivery in real time and see
              exactly where your donation is in the journey.
            </p>

          </div>

          <button
            type="button"
            className="tracking-refresh"
            onClick={() => fetchDelivery(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "tracking-spin" : ""}
            />

            {refreshing ? "Updating..." : "Refresh"}
          </button>

        </section>

        {/* =================================================
            CURRENT STATUS
            ================================================= */}

        <section className="current-status-card">

          <div className="status-main">

            <div className="status-icon">
              {currentStatus === "completed" ? (
                <CheckCircle2 size={25} />
              ) : currentStatus === "picked_up" ||
                currentStatus === "assigned" ? (
                <Truck size={25} />
              ) : (
                <Clock3 size={25} />
              )}
            </div>

            <div>

              <span className="status-label">
                CURRENT STATUS
              </span>

              <h2>
                {statusLabels[currentStatus] ||
                  "Delivery in progress"}
              </h2>

              <p>
                {statusText[currentStatus] ||
                  "Your delivery is being processed."}
              </p>

            </div>

          </div>

          <div className="status-live">

            <span className="status-live-dot" />

            <span>Updating every 15 sec</span>

          </div>

        </section>

        {/* =================================================
            DELIVERY INFO
            ================================================= */}

        <section className="delivery-info-grid">

          {/* FOOD */}
          <div className="delivery-info-card">

            <div className="info-card-icon">
              <Utensils size={19} />
            </div>

            <div>

              <span className="info-label">
                FOOD DONATION
              </span>

              <strong>{foodName}</strong>

              {delivery.foodId?.quantity && (
                <p>
                  {delivery.foodId.quantity} meals
                </p>
              )}

            </div>

          </div>

          {/* VOLUNTEER */}
          <div className="delivery-info-card">

            <div className="info-card-icon">
              <UserRound size={19} />
            </div>

            <div>

              <span className="info-label">
                VOLUNTEER
              </span>

              {volunteer ? (
                <>
                  <strong>{volunteer.name}</strong>

                  {volunteer.phone && (
                    <a
                      href={`tel:${volunteer.phone}`}
                      className="phone-link"
                    >
                      <Phone size={12} />
                      {volunteer.phone}
                    </a>
                  )}
                </>
              ) : (
                <>
                  <strong>Finding volunteer</strong>
                  <p>We'll notify you when assigned</p>
                </>
              )}

            </div>

          </div>

          {/* DELIVERY ID */}
          <div className="delivery-info-card">

            <div className="info-card-icon">
              <ShieldCheck size={19} />
            </div>

            <div>

              <span className="info-label">
                DELIVERY ID
              </span>

              <strong className="delivery-id">
                #{delivery._id?.slice(-8).toUpperCase()}
              </strong>

              <p>Verified SharePlate delivery</p>

            </div>

          </div>

        </section>

        {/* =================================================
            TIMELINE
            ================================================= */}

        <section className="tracking-section-card">

          <div className="tracking-section-header">

            <div>

              <span className="section-kicker">
                DELIVERY JOURNEY
              </span>

              <h2>
                Progress so far
              </h2>

            </div>

            <div className="journey-icon">
              <Truck size={20} />
            </div>

          </div>

          <div className="timeline-wrapper">
            <DeliveryStatusTimeline
              currentStatus={currentStatus}
            />
          </div>

        </section>

        {/* =================================================
            MAP
            ================================================= */}

        <section className="tracking-section-card map-card">

          <div className="tracking-section-header">

            <div>

              <span className="section-kicker">
                LIVE LOCATION
              </span>

              <h2>
                Follow the delivery
              </h2>

              <p>
                The map shows the latest available
                location of your delivery.
              </p>

            </div>

            <div className="map-live-badge">
              <span />
              Live
            </div>

          </div>

          <div className="tracking-map-wrapper">
            <LiveTrackingMap delivery={delivery} />
          </div>

        </section>

        {/* =================================================
            CHAT
            ================================================= */}

        <section className="tracking-section-card chat-card">

          <div className="tracking-section-header">

            <div>

              <span className="section-kicker">
                COMMUNICATION
              </span>

              <h2>
                Stay connected
              </h2>

              <p>
                Need to coordinate the pickup or delivery?
                Send a message here.
              </p>

            </div>

            <div className="chat-icon">
              <MessageCircle size={20} />
            </div>

          </div>

          <div className="chat-wrapper">
            <ChatBox deliveryId={delivery._id} />
          </div>

        </section>

        {/* =================================================
            FOOTER NOTE
            ================================================= */}

        <div className="tracking-footer-note">

          <ShieldCheck size={16} />

          <span>
            SharePlate keeps delivery information secure
            and only shares it with the people involved in
            this delivery.
          </span>

        </div>

      </div>
    </div>
  );
};

export default DeliveryTracking;