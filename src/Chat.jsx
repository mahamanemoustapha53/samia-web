import { useState } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

const API_URL = "https://samia-server.onrender.com/chat";
const TOKEN = "MASMM_SUPER_SECRET_2006";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [chats, setChats] = useState([{ id: 1, title: "Nouveau chat" }]);
    const [currentChat, setCurrentChat] = useState(1);
    const [history, setHistory] = useState([]);

    const login = async () => {
        await signInWithPopup(auth, provider);
    };

    const loadHistory = async (userId) => {
        const q = query(
            collection(db, "chats"),
            where("uid", "==", userId)
        );

        const snap = await getDocs(q);

        const data = [];

        snap.forEach(doc => {
            data.push(doc.data());
        });

        setHistory(data);
    };

    const createConversation = async (user) => {
        const docRef = await addDoc(collection(db, "conversations"), {
            uid: user.uid,
            title: "Nouveau chat",
            messages: [],
            createdAt: new Date()
        });

        return docRef.id;
    };

    const sendToConversation = async (convoId, message, response) => {
        const ref = doc(db, "conversations", convoId);

        await updateDoc(ref, {
            messages: arrayUnion(
                { role: "user", text: message },
                { role: "bot", text: response }
            )
        });
    };

    const [user, setUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) loadHistory(u.uid);
        });
    }, []);

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.lang = "fr-FR";

        recognition.start();

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setInput(text);
        };
    };

    const speak = (text) => {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "fr-FR";
  window.speechSynthesis.speak(speech);
};

    const sendMessage = async () => {
        if (!input) return;

        const userMessage = { role: "user", text: input };
        setMessages(prev => [...prev, userMessage]);

        const tempInput = input;
        setInput("");

        setMessages(prev => [...prev, { role: "bot", text: "SAMIA réfléchit..." }]);

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": TOKEN
            },
            body: JSON.stringify({ message: tempInput })
        });

        const data = await res.json();

        setMessages(prev => {
            const updated = [...prev];
            updated.pop(); // remove "réfléchit..."

            // 🔥 SI COMMANDE
            if (data.type === "command") {
                updated.push({
                    role: "bot",
                    text: `⚙️ Exécution de la commande: ${data.command}`
                });

                // envoyer commande au serveur agent
                fetch("https://samia-server.onrender.com/command", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": TOKEN
                    },
                    body: JSON.stringify({ command: data.command })
                });

                return updated;
            }

            // 🔥 SI TEXTE NORMAL
            updated.push({
                role: "bot",
                text: data.response
            });

            return updated;
        });

        if (user) {
            await addDoc(collection(db, "chats"), {
                uid: user.uid,
                message: tempInput,
                response: data.response || data.command,
                timestamp: new Date()
            });
        }

        speak(data.response);
    };

    const newChat = () => {
        const id = chats.length + 1;
        setChats([...chats, { id, title: "Nouveau chat " + id }]);
        setMessages([]);
        setCurrentChat(id);
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white" }}>

            <button onClick={login}>
                Login Google
            </button>

            <button onClick={startListening}>
                🎤 Parler
            </button>

            {/* SIDEBAR */}
            <div style={{ width: "250px", background: "#020617", padding: "10px" }}>
                <button onClick={newChat} style={{ width: "100%", padding: "10px" }}>
                    + Nouveau chat
                </button>

                <h4 style={{ marginTop: 20 }}>Historique</h4>

                {conversations.map(c => (
                    <div key={c.id} onClick={() => setCurrent(c.id)}>
                        {c.title}
                    </div>
                ))}

                {history.map((item, i) => (
                    <div key={i}
                        style={{
                            padding: 10,
                            marginTop: 10,
                            background: "#1e293b",
                            cursor: "pointer",
                            borderRadius: 8
                        }}>
                        {item.message.slice(0, 20)}...
                    </div>
                ))}

                {chats.map(chat => (
                    <div key={chat.id}
                        onClick={() => setCurrentChat(chat.id)}
                        style={{
                            padding: "10px",
                            marginTop: "10px",
                            background: currentChat === chat.id ? "#1e293b" : "transparent",
                            cursor: "pointer"
                        }}>
                        {chat.title}
                    </div>
                ))}
            </div>

            {/* CHAT ZONE */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                {/* MESSAGES */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                    {messages.map((msg, i) => (
                        <div key={i}
                            style={{
                                background: msg.role === "user" ? "#2563eb" : "#1e293b",
                                padding: "12px",
                                margin: "10px 0",
                                borderRadius: "10px",
                                textAlign: msg.role === "user" ? "right" : "left"
                            }}>
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* INPUT */}
                <div style={{ padding: "10px", borderTop: "1px solid #1e293b" }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Écris ton message..."
                        style={{
                            width: "80%",
                            padding: "10px",
                            background: "#020617",
                            color: "white",
                            border: "none"
                        }}
                    />

                    <button onClick={sendMessage} style={{ padding: "10px" }}>
                        Envoyer
                    </button>
                </div>

            </div>
        </div>
    );
}