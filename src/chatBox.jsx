import "./App.css";

export default function ChatBox({ messages }) {
  return (
    <div className="chat-container">
      {messages.map((m, i) => (
        <div key={i} className={`bubble ${m.role}`}>
          <strong>{m.role === "user" ? "You" : "Agent"}:</strong> {m.message}
        </div>
      ))}
    </div>
  );
}
