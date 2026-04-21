import { useState } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import {
    collection,
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
    const [screen, setScreen] = useState(null);

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

    const [conversations, setConversations] = useState([]);

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

    const fetchScreen = async () => {
        const res = await fetch("https://samia-server.onrender.com/get_screen", {
            headers: { Authorization: TOKEN }
        });

        const data = await res.json();
        setScreen(data.image);
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

        // 🔥 SI COMMANDE
        if (data.type === "command") {
            setMessages(prev => {
                const updated = [...prev];
                updated.pop();
                updated.push({
                    role: "bot",
                    text: `⚙️ Exécution: ${data.command}`
                });
                return updated;
            });

            await fetch("https://samia-server.onrender.com/command", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": TOKEN
                },
                body: JSON.stringify({ command: data.command })
            });

            return;
        }

        if (data.type === "screen") {
            if (data.action === "start") {
                showScreen && screen && (true);
            } else {
                showScreen && screen && (false);
            }
        }

        // 🔥 SI IA → attendre réponse de l'agent
        let answer = null;

        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1000));

            const res2 = await fetch("https://samia-server.onrender.com/get_answer", {
                headers: {
                    "Authorization": TOKEN
                }
            });

            const data2 = await res2.json();

            if (data2.answer) {
                answer = data2.answer;
                break;
            }
        }

        setMessages(prev => {
            const updated = [...prev];
            updated.pop();
            updated.push({
                role: "bot",
                text: answer || "❌ Pas de réponse"
            });
            return updated;
        });

        speak(answer);
    };

    const [showScreen, setShowScreen] = useState(false);

    const newChat = () => {
        const id = chats.length + 1;
        setChats([...chats, { id, title: "Nouveau chat " + id }]);
        setMessages([]);
        setCurrentChat(id);
    };

    useEffect(() => {
        const interval = setInterval(fetchScreen, 1000);
        return () => clearInterval(interval);
    }, []);

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

                {screen && (
                    <img
                        src={`data:image/jpeg;base64,${screen}`}
                        style={{
                            width: "300px",
                            position: "fixed",
                            bottom: 10,
                            right: 10,
                            borderRadius: "10px"
                        }}
                    />
                )}

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