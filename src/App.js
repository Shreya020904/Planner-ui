import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import TaskScheduler from "./pages/TaskScheduler";
import ScrumBoard from "./pages/ScrumBoard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import { ThemeProvider } from "./ThemeContext"; // Import ThemeProvider

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to /login */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/task-scheduler" element={<TaskScheduler />} />
                    <Route path="/scrum-board" element={<ScrumBoard />} />
                    <Route path="/account" element={<Account />} />

                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;