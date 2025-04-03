import React, { useState, useContext } from "react";
import { db } from "../firebase"; // Import Firestore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./TaskScheduler.css"; // Keep for any custom styles
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { ThemeContext } from '../ThemeContext'; // Import ThemeContext

const TaskScheduler = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [taskName, setTaskName] = useState("");
    const [taskType, setTaskType] = useState("Meeting");
    const [taskDate, setTaskDate] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const { theme } = useContext(ThemeContext); // Consume ThemeContext

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, "tasks"), {
                taskName,
                taskType,
                taskDate,
                taskTime,
                createdAt: serverTimestamp(),
            });
            console.log("Task Scheduled Successfully");

            // Reset form
            setTaskName("");
            setTaskDate("");
            setTaskTime("");
        } catch (error) {
            console.error("Error scheduling task:", error);
        }
    };

    // Define theme-based styles
    const lightMode = {
        background: '#f5e6d9', // Cream
        text: '#4b0082',       // Purple
        primary: '#8a2be2',    // Purple for buttons
        secondary: '#f5e6d9',  // Light purple
        boxShadow: '0 2px 4px rgba(138, 43, 226, 0.2)', // Smaller purple box shadow
        border: '1px solid #8a2be2', // Purple border
        containerBg: '#f0d9ff', // White background for the container box
    };

    const darkMode = {
        background: '#121212', // Dark
        text: '#4b0082',       // Light purple
        primary: '#a78bfa',    // Light purple for buttons
        secondary: '#f5e6d9',      // Dark grey
        boxShadow: '0 2px 4px rgba(167, 139, 250, 0.2)', // Smaller light purple box shadow
        border: '1px solid #a78bfa', // Light purple border
        containerBg: '#f0d9ff', // Darker background for the container box
    };

    const currentTheme = theme === 'light' ? lightMode : darkMode;

    const sidebarWidth = sidebarOpen ? '250px' : '0'; // Adjust as needed

    return (
        <div className="task-container" style={{ backgroundColor: currentTheme.background, color: currentTheme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header toggleSidebar={toggleSidebar} />
            <div className="task-content d-flex" style={{ backgroundColor: currentTheme.background, flexGrow: 1, marginLeft:'20px' }}>
                <Sidebar isOpen={sidebarOpen} />
                <main className="task-main p-4 flex-grow-1" style={{
                    backgroundColor: currentTheme.background,
                    marginLeft: sidebarWidth,
                    transition: 'margin-left 0.3s ease-in-out',
                }}>
                    <Container
                        style={{
                            backgroundColor: currentTheme.containerBg,
                            boxShadow: currentTheme.boxShadow,
                            borderRadius: '8px',
                            border: currentTheme.border,
                            padding: '20px', // Add some padding inside the box
                        }}
                    >
                        <Row className="justify-content-center">
                            <Col md={12}> {/* Adjusted to take full width within the box */}
                                <h2 className="mb-4 text-center" style={{ color: currentTheme.text }}>Schedule a Task</h2>
                                <Form onSubmit={handleSubmit} style={{ backgroundColor: currentTheme.containerBg }}> {/* Ensure form background matches container */}
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="Task Name"
                                            value={taskName}
                                            onChange={(e) => setTaskName(e.target.value)}
                                            required
                                            style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text, borderColor: currentTheme.primary }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Select
                                            value={taskType}
                                            onChange={(e) => setTaskType(e.target.value)}
                                            style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text, borderColor: currentTheme.primary }}
                                        >
                                            <option value="Meeting">Meeting</option>
                                            <option value="Task">Task</option>
                                            <option value="Issue Sorting">Issue Sorting</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="date"
                                                    value={taskDate}
                                                    onChange={(e) => setTaskDate(e.target.value)}
                                                    required
                                                    style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text, borderColor: currentTheme.primary }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="time"
                                                    value={taskTime}
                                                    onChange={(e) => setTaskTime(e.target.value)}
                                                    required
                                                    style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text, borderColor: currentTheme.primary }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Button variant="primary" type="submit" style={{ backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }}>
                                        Schedule Task
                                    </Button>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                </main>
            </div>
        </div>
    );
};

export default TaskScheduler;