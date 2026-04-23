import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export default function Login() {

  const login = async () => {
    await signInWithPopup(auth, provider);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f172a",
      color: "white",
      flexDirection: "column"
    }}>
      <h1>SAMIA</h1>

      <button onClick={login} style={{
        padding: "10px 20px",
        background: "#2563eb",
        border: "none",
        color: "white",
        cursor: "pointer"
      }}>
        Se connecter avec Google
      </button>
    </div>
  );
}