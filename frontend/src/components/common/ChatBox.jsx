import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getChatHistory } from "../../services/chat.service";

const ChatBox = ({ deliveryId }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getChatHistory(deliveryId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("track-delivery", deliveryId);

    const handleNewMessage = (msg) => {
      if (msg.deliveryId === deliveryId || msg.deliveryId?.toString() === deliveryId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new-chat-message", handleNewMessage);
    return () => socket.off("new-chat-message", handleNewMessage);
  }, [socket, deliveryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !socket) return;

    socket.emit("send-chat-message", {
      deliveryId,
      senderId: user._id,
      senderRole: user.role,
      text: text.trim(),
    });

    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h4>Delivery Chat</h4>

      <div
        style={{
          height: 220,
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          background: "#fafefa",
        }}
      >
        {loading ? (
          <p style={{ fontSize: 13, color: "#999" }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontSize: 13, color: "#999" }}>No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
            return (
              <div
                key={msg._id}
                style={{
                  textAlign: isMe ? "right" : "left",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: isMe ? "#2e7d32" : "#e8f5e9",
                    color: isMe ? "white" : "#1e2a1e",
                    padding: "6px 10px",
                    borderRadius: 10,
                    fontSize: 13,
                    maxWidth: "75%",
                  }}
                >
                  {!isMe && (
                    <strong style={{ display: "block", fontSize: 11 }}>
                      {msg.senderId?.name} ({msg.senderRole})
                    </strong>
                  )}
                  {msg.text}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ margin: 0 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;