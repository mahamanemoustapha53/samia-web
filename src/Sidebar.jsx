export default function Sidebar({ conversations, setCurrent }) {
  return (
    <div style={{
      width: "260px",
      background: "#020617",
      color: "white",
      padding: "10px"
    }}>
      <button style={{ width: "100%", padding: 10 }}>
        + Nouveau chat
      </button>

      <h4 style={{ marginTop: 20 }}>Conversations</h4>

      {conversations.map((c, i) => (
        <div
          key={i}
          onClick={() => setCurrent(c)}
          style={{
            padding: 10,
            marginTop: 10,
            background: "#1e293b",
            cursor: "pointer",
            borderRadius: 8
          }}
        >
          {c.title}
        </div>
      ))}
    </div>
  );
}