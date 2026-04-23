export default function Header({ user }) {
  return (
    <div style={{
      height: "60px",
      background: "#020617",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 15px",
      color: "white"
    }}>
      <h3>SAMIA</h3>

      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={user.photoURL}
          style={{ width: 35, borderRadius: "50%", marginRight: 10 }}
        />
        <span>{user.displayName}</span>
      </div>
    </div>
  );
}