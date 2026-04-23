import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const API_URL = "https://samia-server.onrender.com";
const TOKEN = "MASMM_SUPER_SECRET_2006";

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [screen, setScreen] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [current, setCurrent] = useState(null);

  // 🔥 charger conversations
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "conversations"));
      const data = snap.docs.map(doc => doc.data());
      setConversations(data);
    };
    load();
  }, []);

  // 🔥 écran live
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/get_screen`, {
          headers: { Authorization: TOKEN },
        });
        const data = await res.json();
        setScreen(data.image);
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const temp = input;
    setInput("");

    setMessages(prev => [...prev, { role: "bot", text: "..." }]);

    await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: TOKEN,
      },
      body: JSON.stringify({ message: temp }),
    });

    let answer = null;

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));

      const res = await fetch(`${API_URL}/get_answer`, {
        headers: { Authorization: TOKEN },
      });

      const d = await res.json();

      if (d.answer) {
        answer = d.answer;
        break;
      }
    }

    setMessages(prev => {
      const updated = [...prev];
      updated.pop();
      updated.push({ role: "bot", text: answer || "Erreur" });
      return updated;
    });

    // 🔥 sauvegarde Firebase
    await addDoc(collection(db, "conversations"), {
      uid: user.uid,
      title: temp,
      messages: [...messages, userMsg],
      createdAt: new Date()
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <Sidebar conversations={conversations} setCurrent={setCurrent} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Header user={user} />

        {/* écran */}
        {screen && (
          <img
            src={`data:image/jpeg;base64,${screen}`}
            style={{ maxHeight: 150 }}
          />
        )}

        {/* messages */}
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              textAlign: m.role === "user" ? "right" : "left"
            }}>
              <div style={{
                display: "inline-block",
                padding: 10,
                background: m.role === "user" ? "#2563eb" : "#1e293b",
                color: "white",
                margin: 5,
                borderRadius: 10
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <div style={{ display: "flex", padding: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={sendMessage}>Envoyer</button>
        </div>

      </div>
    </div>
  );
}