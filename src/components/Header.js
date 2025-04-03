import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Menu, Mic, Bell } from 'lucide-react'; // Import Mic and Bell icons
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeContext } from '../ThemeContext'; // Import ThemeContext

const Header = ({ toggleSidebar }) => {
    const [username, setUsername] = useState("User");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const [activeMenu, setActiveMenu] = useState('');
    const { isDarkMode, toggleTheme } = useContext(ThemeContext); // Use ThemeContext
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null); // Ref for SpeechRecognition

    useEffect(() => {
        const storedUsername = localStorage.getItem("username") || "User";
        setUsername(storedUsername);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("username");
        navigate("/login");
    };

    const handleThemeChange = () => {
        toggleTheme();
    };

    // Voice command functionality
    const startVoiceRecognition = () => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognitionRef.current = recognition; // Store recognition object
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                console.log("Voice recognition started");
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Transcript:", transcript);
                processVoiceCommand(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
                console.log("Voice recognition ended");
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert('Speech recognition is not supported in this browser.');
        }
    };

    const stopVoiceRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleVoiceRecognition = () => {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    };

    const processVoiceCommand = (command) => {
        switch (command) {
            case 'dashboard':
                navigate('/dashboard');
                break;
            case 'chat':
                navigate('/chat');
                break;
            case 'task scheduler':
            case 'task schedular':
                navigate('/task-scheduler');
                break;
            case 'scrum board':
                navigate('/scrum-board');
                break;
            case 'account':
                navigate('/account');
                break;
            case 'logout':
                handleLogout();
                break;
            case 'close sidebar':
                { toggleSidebar(); setActiveMenu('sidebar'); }
                break;
                case 'open sidebar':
                    { toggleSidebar(); setActiveMenu('sidebar'); }
                    break;
            default:
                alert(`Command "${command}" not recognized.`);
        }
    };

    return (
        <Navbar
            bg={isDarkMode ? "dark" : "cream"}
            variant={isDarkMode ? "dark" : "light"}
            fixed="top"
            className="shadow-custom"
            style={{
                backgroundColor: isDarkMode ? '#121212' : '#f5e6d9',
                height: '85px',
                boxShadow: '0px 4px 8px rgba(138, 43, 226, 0.3)',
                borderBottom: '2px solid rgba(138, 43, 226, 0.8)',

            }}
        >
            <Button
                variant="outline-secondary"
                onClick={() => { toggleSidebar(); setActiveMenu('sidebar'); }}
                className="me-2"
                style={{
                    backgroundColor: activeMenu === 'sidebar' ? '#f0d9ff' : 'transparent',
                    border: '2px solid rgb(90, 28, 105)',
                    padding: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    marginLeft: '20px',
                    boxShadow: '2px 2px 8px rgba(138, 43, 226, 0.5)',
                    color: isDarkMode ? '#fff' : '#8a2be2'
                }}
            >
                <Menu color={isDarkMode ? "#fff" : "#8a2be2"} size={24} />
            </Button>
            <Container fluid>
                <Navbar.Brand
                    href="#"
                    className={isDarkMode ? "text-white" : "text-purple"}
                    style={{ color: isDarkMode ? '#fff' : ' rgb(90, 28, 105)', fontWeight: 'bold', marginLeft: 'auto', marginRight: 'auto' }} // Center the brand
                    onClick={() => setActiveMenu('planner')}
                >
                    Planner
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                    <Nav className="mr-auto"></Nav>
                    <Nav className="align-items-center">

                        <Button
                            variant="outline-secondary"
                            onClick={toggleVoiceRecognition}
                            className="me-2"
                            style={{
                                backgroundColor: isListening ? '#ff6b6b' : 'transparent', // Change color when listening
                                border: '2px solid #8a2be2',
                                color: isDarkMode ? '#fff' : '#8a2be2',
                                borderRadius: '8px',
                                padding: '8px',
                                boxShadow: '2px 2px 8px rgba(138, 43, 226, 0.5)',
                                transition: 'background-color 0.3s ease, color 0.3s ease'
                            }}
                        >
                            <Mic color={isDarkMode ? "#fff" : "#8a2be2"} size={24} />
                        </Button>

                        <div ref={notifRef}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => { setNotifOpen(!notifOpen); setActiveMenu('notification'); }}
                                className="me-2"
                                style={{
                                    backgroundColor: activeMenu === 'notification' ? '#f0d9ff' : 'transparent',
                                    border: '2px solid #8a2be2',
                                    color: isDarkMode ? '#fff' : '#8a2be2',
                                    borderRadius: '8px',
                                    boxShadow: '2px 2px 8px rgba(138, 43, 226, 0.5)',
                                    transition: 'background-color 0.3s ease, color 0.3s ease'
                                }}
                            >
                                <Bell color={isDarkMode ? "#fff" : "#8a2be2"} size={24} />
                            </Button>
                            {notifOpen && (
                                <div className="dropdown-menu dropdown-menu-end notif-dropdown-custom show" style={{ right: 0, backgroundColor: isDarkMode ? '#1a1a1a' : '#fff', border: isDarkMode ? '1px solid #333' : '1px solid #ccc' }}>
                                    <div className="dropdown-item" style={{ color: isDarkMode ? '#fff' : '#4b0082', padding: '10px', transition: 'background-color 0.2s ease', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={(e) => { e.target.style.backgroundColor = isDarkMode ? '#222' : '#f8f9fa'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}>No new notifications</div>
                                </div>
                            )}
                        </div>
                        <div ref={dropdownRef}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => { setDropdownOpen(!dropdownOpen); setActiveMenu('user'); }}
                                className="user-name-custom me-2"
                                style={{
                                    backgroundColor: activeMenu === 'user' ? '#f0d9ff' : isDarkMode ? '#121212' : '#f5e6d9',
                                    border: '2px solid #6a0dad',
                                    color: isDarkMode ? '#fff' : '#6a0dad',
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    boxShadow: '2px 2px 8px rgba(106, 13, 173, 0.4)',
                                    transition: 'background-color 0.3s ease, color 0.3s ease'
                                }}
                            >
                                {username} ▼
                            </Button>
                            {dropdownOpen && (
                                <div className="dropdown-menu dropdown-menu-end user-dropdown-custom show" style={{ right: 0, backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }}>
                                    <Link to="/account" className="dropdown-item" style={{ color: isDarkMode ? '#fff' : '#4b0082', padding: '10px', transition: 'background-color 0.2s ease', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none' }} onMouseEnter={(e) => { e.target.style.backgroundColor = isDarkMode ? '#222' : '#f8f9fa'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}>Account</Link>
                                    <div className="dropdown-item" onClick={handleThemeChange} style={{ color: isDarkMode ? '#fff' : '#4b0082', cursor: 'pointer', padding: '10px', transition: 'background-color 0.2s ease', borderRadius: '4px', }} onMouseEnter={(e) => { e.target.style.backgroundColor = isDarkMode ? '#222' : '#f8f9fa'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</div>
                                    <div className="dropdown-divider" />
                                    <div className="dropdown-item text-danger" onClick={handleLogout} style={{ color: '#ff4d4d', padding: '10px', transition: 'background-color 0.2s ease', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={(e) => { e.target.style.backgroundColor = isDarkMode ? '#222' : '#f8f9fa'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}>Logout</div>
                                </div>
                            )}
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
