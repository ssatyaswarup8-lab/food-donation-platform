import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../hooks/useSocket";
import { getMyNotifications, markNotificationsRead } from "../../services/notification.service";

const NotificationBell = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchNotifications();

    const events = ["food-claimed", "volunteer-assigned", "delivery-status-update", "food-quality-approved", "food-quality-rejected", "new-chat-message"];
    events.forEach((e) => socket.on(e, refresh));

    return () => events.forEach((e) => socket.off(e, refresh));
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      await markNotificationsRead();
      setUnreadCount(0);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button onClick={handleOpen} className="btn-outline" style={{ position: "relative" }}>
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#d32f2f",
              color: "white",
              borderRadius: "50%",
              fontSize: 10,
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            width: 300,
            maxHeight: 350,
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          <h4 style={{ marginTop: 0 }}>Notifications</h4>
          {notifications.length === 0 ? (
            <p style={{ fontSize: 13, color: "#999" }}>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: 13,
                }}
              >
                <p style={{ margin: 0 }}>{n.message}</p>
                <span style={{ fontSize: 11, color: "#999" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;