export default function Header({ user, toggleMenu }) {
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
      
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={toggleMenu} style={{
          marginRight: 10,
          fontSize: 20,
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer"
        }}>
          ☰
        </button>

        <h3>SAMIA</h3>
      </div>

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