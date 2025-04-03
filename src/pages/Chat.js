import React, { useState, useEffect, useContext } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, onSnapshot, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, InputGroup, Form, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { Send, User } from 'lucide-react';
import { ThemeContext } from '../ThemeContext';
import { motion } from 'framer-motion';

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pinnedContacts, setPinnedContacts] = useState([]);
    const [dropdownOpenUid, setDropdownOpenUid] = useState(null);
    const { theme } = useContext(ThemeContext);
    const aiUser = {
        uid: "ai-bot",
        username: "AI Assistant",
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                let usersList = querySnapshot.docs.map((doc) => ({
                    uid: doc.id,
                    ...doc.data(),
                }));

                // Remove AI User from its original place if it exists.
                usersList = usersList.filter(user => user.uid !== "ai-bot");
                usersList.unshift(aiUser); // Add AI User to the beginning.
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser({ uid: user.uid, username: user.displayName });
            }
        });

        fetchUsers();
        return () => unsubscribe();
    }, []);

    const toggleDropdown = (uid) => {
        setDropdownOpenUid(dropdownOpenUid === uid ? null : uid);
    };

    const pinContact = (user) => {
        if (!pinnedContacts.some((pinned) => pinned.uid === user.uid)) {
            setPinnedContacts([...pinnedContacts, user]);
        }
        setDropdownOpenUid(null);
    };

    const unpinContact = (userUid) => {
        setPinnedContacts(pinnedContacts.filter(contact => contact.uid !== userUid));
        setDropdownOpenUid(null);
    };

    useEffect(() => {
        if (currentUser && selectedUser) {
            const chatId = [currentUser.uid, selectedUser.uid].sort().join("_");
            const chatRef = collection(db, "chats", chatId, "messages");
            const q = query(chatRef, orderBy("timestamp"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMessages(fetchedMessages);
            });

            return () => unsubscribe();
        }
    }, [selectedUser, currentUser]);

    const sendMessage = async () => {
        if (newMessage.trim() === "" || !selectedUser) return;

        const chatId = [currentUser.uid, selectedUser.uid].sort().join("_");
        const chatRef = collection(db, "chats", chatId, "messages");

        await addDoc(chatRef, {
            sender: currentUser.uid,
            message: newMessage,
            timestamp: serverTimestamp(),
        });

        if (selectedUser.uid === "ai-bot") {
            const aiResponse = generateAIResponse(newMessage);

            setTimeout(async () => {
                await addDoc(chatRef, {
                    sender: "ai-bot",
                    message: aiResponse,
                    timestamp: serverTimestamp(),
                });
            }, 1000);
        }

        setNewMessage("");
    };

    const generateAIResponse = (userMessage) => {
        userMessage = userMessage.toLowerCase();

        if (userMessage.includes("hello") || userMessage.includes("hi")) {
            return "Hello! How can I assist you today? 😊";
        }
        if (userMessage.includes("help")) {
            return "Sure! I can help with anything related to this chat app.";
        }
        if (userMessage.includes("your name")) {
            return "I'm your AI assistant! 🤖";
        }
        if (userMessage.includes("bye")) {
            return "Goodbye! Have a great day. 👋";
        }

        return "I'm still learning! Ask me something else. 😊";
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        try {
            return new Date(timestamp.seconds * 1000).toLocaleDateString();
        } catch (e) {
            return "";
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        try {
            return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return "";
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const backgroundColor = theme === 'dark' ? '#121212' : '#f5e6d9';
    const textColor = theme === 'dark' ? '#fff' : '#4b0082';
    const lightPurple = theme === 'dark' ? 'rgba(138, 43, 226, 0.5)' : '#f0d9ff';
    const lightCream = theme === 'dark' ? '#444' : '#f5e6d9';
    const purple = theme === 'dark' ? '#a78bfa' : '#8a2be2';
    const lightDark = theme === 'dark' ? '#ccc' : '#f5e6d9';
    const border = theme === 'dark' ? '1px solid #333' : '1px solid #d3d3d3';
    const inputBackground = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    const inputBorder = theme === 'dark' ? '1px solid #555' : '1px solid rgb(229, 237, 214)';
    const contactHoverBg = theme === 'dark' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(240, 217, 255, 0.3)';
    const contactActiveBg = theme === 'dark' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(240, 217, 255, 0.5)';
    const activeUsernameColor = theme === 'dark' ? lightDark : lightCream;
    const activeUsernameUnderline = purple;

    // New NavItem Component
    const NavItem = ({ user, active, onClick, isPinned }) => {
        const [isHovered, setIsHovered] = useState(false);
        const currentTextColor = active ? (theme === 'dark' ? '#d6adff' : 'rgb(112, 36, 131)') : textColor;
        const currentBackgroundColor = active ? (theme === 'dark' ? '#333' : '#f5e6d9') : 'transparent';

        return (
            <motion.li
                className="nav-item"
                style={{
                    marginBottom: '0',
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    width: '100%',
                    backgroundColor: active ? (theme === 'dark' ? '#333' : '#f5e6d9') : 'transparent',
                }}
                whileHover={{
                    backgroundColor: isHovered ? (theme === 'dark' ? '#222' : '#d8b4fe') : 'transparent',
                    scale: isHovered ? 1.05 : 1,

                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
            >
                <div
                    className={`nav-link d-flex align-items-center justify-content-between p-3`}
                    style={{
                        cursor: 'pointer',
                        color: currentTextColor,
                        textDecoration: 'none',
                        borderRadius: '0',
                        backgroundColor: currentBackgroundColor,
                        position: 'relative',
                        fontWeight: 'bold',
                        width: '100%',
                    }}
                >
                    <div className="d-flex align-items-center">
                        <User className="mr-2" size={20} color={purple} />
                        <span style={{ color: currentTextColor }}>
                            {user.username}
                        </span>
                    </div>
                    {user.uid !== "ai-bot" && (  // IMPORTANT:  Don't show dropdown for AI Assistant
                        <Dropdown>
                            <DropdownToggle variant="link" as="span" onClick={(e) => { e.stopPropagation(); toggleDropdown(user.uid); }} style={{ cursor: 'pointer', color: purple }}>
                                {isPinned ? '📌' : '⋮'}
                            </DropdownToggle>
                            <DropdownMenu show={dropdownOpenUid === user.uid} style={{ backgroundColor: inputBackground, border: border, color: textColor }}>
                                {isPinned ? (
                                    <DropdownItem onClick={(e) => { e.stopPropagation(); unpinContact(user.uid); }} style={{ color: textColor, cursor: 'pointer', backgroundColor: 'transparent', ':hover': { backgroundColor: lightPurple } }}>
                                        📍 Unpin Contact
                                    </DropdownItem>
                                ) : (
                                    <DropdownItem onClick={(e) => { e.stopPropagation(); pinContact(user); }} style={{ color: textColor, cursor: 'pointer', backgroundColor: 'transparent', ':hover': { backgroundColor: lightPurple } }}>
                                        📌 Pin Contact
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </div>
            </motion.li>
        );
    };


    return (
        <div className="d-flex h-100" style={{ backgroundColor: backgroundColor, color: textColor }}>
            {/* Header */}
            <Header toggleSidebar={toggleSidebar} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} />

            {/* Main Chat Area */}
            <div
                className={`flex-grow-1 d-flex flex-column ${sidebarOpen ? "ml-250" : ""
                    } transition-all duration-300 ease-in-out`}
                style={{}}
            >
                {/* Chat Sidebar (Contact List) */}
                <div
                    className="chat-sidebar"
                    style={{
                        backgroundColor: lightPurple,
                        width: '300px',
                        borderRight: '2px solid #8a2be2',
                        borderLeft: '2px solid #8a2be2',
                        overflowY: 'auto',
                        position: 'fixed',
                        top: '78px',
                        marginLeft: sidebarOpen ? '300px' : '0',
                        height: 'calc(100vh - 78px)',
                        zIndex: 1000,
                        transition: 'transform 0.3s ease-in-out, margin-left 0.3s ease-in-out',
                        transform: 'translateX(0)',
                    }}
                >
                    <h2 className="p-3" style={{ margin: 0, color: textColor, borderBottom: '1px solid #8a2be2', boxShadow: '0px -4px 8px rgba(138, 43, 226, 0.6)' }}>Contacts</h2>
                    <Form.Control
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="m-3"
                        style={{ backgroundColor: inputBackground, border: border, color: textColor, width: 'calc(100% - 30px)' }}
                    />
                    <ul className="list-unstyled" style={{ margin: 0, padding: 0 }}>
                        {/* Render AI Assistant first */}
                        <NavItem
                            key={aiUser.uid}
                            user={aiUser}
                            active={selectedUser?.uid === aiUser.uid}
                            onClick={() => setSelectedUser(aiUser)}
                            isPinned={true} // AI Assistant is always treated as pinned.
                        />
                        {pinnedContacts
                            .filter(contact => contact.uid !== "ai-bot") // Exclude AI user from pinned.
                            .map((user) => (
                                <NavItem
                                    key={user.uid}
                                    user={user}
                                    active={selectedUser?.uid === user.uid}
                                    onClick={() => setSelectedUser(user)}
                                    isPinned={true}
                                />
                            ))}
                        {users
                            .filter((user) => user.uid !== currentUser?.uid)
                            .filter((user) => user.uid !== "ai-bot")
                            .filter((user) => !pinnedContacts.some(pinned => pinned.uid === user.uid))
                            .filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((user) => (
                                <NavItem
                                    key={user.uid}
                                    user={user}
                                    active={selectedUser?.uid === user.uid}
                                    onClick={() => setSelectedUser(user)}
                                    isPinned={false}
                                />
                            ))}
                    </ul>
                </div>

                {/* Chat Box */}
                <div
                    className="chat-box flex-grow-1"
                    style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'hidden',
                        backgroundColor: backgroundColor,
                        marginLeft: sidebarOpen ? '590px' : '300px',
                        transition: 'margin-left 0.3s ease-in-out',
                        marginTop: '78px',
                        height: 'calc(100vh - 78px)',
                    }}
                >
                    {selectedUser ? (
                        <>
                            <div
                                className="chat-header p-3 mb-4"
                                style={{ backgroundColor: lightCream, borderBottom: `2px solid ${purple}`, color: textColor, boxShadow: '0px 4px 8px rgba(138, 43, 226, 0.2)' }}
                            >
                                <h2 style={{ margin: 0 }}>{selectedUser.username}</h2>
                            </div>
                            <div
                                className="chat-messages flex-grow-1 overflow-auto"
                                style={{ marginBottom: '20px' }}
                            >
                                {messages.map((msg, index) => {
                                    const prevDate = index > 0 ? formatDate(messages[index - 1].timestamp) : null;
                                    const currentDate = formatDate(msg.timestamp);
                                    const showDate = prevDate !== currentDate;

                                    return (
                                        <div key={index} className="message-container">
                                            {showDate && (
                                                <div
                                                    className="chat-date text-center py-2 mb-2"
                                                    style={{
                                                        backgroundColor: theme === 'dark' ? '#555' : '#e0c1ab',
                                                        borderRadius: '12px',
                                                        color: textColor,
                                                        display: 'inline-block',
                                                        padding: '5px 10px',
                                                        fontSize: '0.8rem',
                                                        marginBottom: '10px',
                                                        width: '100%',
                                                    }}
                                                >
                                                    {currentDate}
                                                </div>
                                            )}
                                            <div
                                                className={`message p-2 rounded-lg mb-2 ${msg.sender === currentUser?.uid ? "sent" : msg.sender === "ai-bot" ? "received ai" : "received"}`}
                                                style={{
                                                    maxWidth: '70%',
                                                    clear: 'both',
                                                    float: msg.sender === currentUser?.uid ? 'right' : 'left',
                                                    backgroundColor: msg.sender === currentUser?.uid ? purple : msg.sender === 'ai-bot' ? lightPurple : lightCream,
                                                    color: msg.sender === currentUser?.uid ? '#ffffff' : textColor,
                                                    borderRadius: '20px',
                                                    borderBottomLeftRadius: msg.sender === currentUser?.uid ? '20px' : '5px',
                                                    borderBottomRightRadius: msg.sender === currentUser?.uid ? '5px' : '20px',
                                                }}
                                            >
                                                {msg.message}
                                                <div
                                                    className="message-timestamp mt-1 text-right"
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        color: msg.sender === currentUser?.uid ? 'rgba(255,255,255,0.7)' : 'rgba(75,0,130,0.7)',
                                                    }}
                                                >
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="chat-input" style={{ boxShadow: '0px -4px 8px rgba(138, 43, 226, 0.6)' }}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                        style={{ backgroundColor: inputBackground, border: inputBorder, color: textColor }}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={sendMessage}
                                        style={{ backgroundColor: lightPurple, borderColor: purple, color: purple, ':hover': { backgroundColor: purple, color: lightCream } }}
                                    >
                                        <Send size={20} />
                                    </Button>
                                </InputGroup>
                            </div>
                        </>
                    ) : (
                        <div
                            className="no-chat-selected d-flex align-items-center justify-content-center h-100"
                            style={{ color: textColor }}
                        >
                            Select a user to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
