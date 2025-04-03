import React, { useEffect, useState, useContext } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ScrumBoard.css"; // Keep for any custom styles
import { Table } from 'react-bootstrap';
import { ThemeContext } from '../ThemeContext';

const ScrumBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "tasks"));
                const taskList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setTasks(taskList);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchTasks();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, { status });
            setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)));
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    // Define theme-based styles
    const lightMode = {
        background: '#f5e6d9', // Cream
        text: '#4b0082',       // Purple
        tableHeaderBg: '#8a2be2', // Purple for table header
        tableHeaderColor: '#fff', // White text for table header
        tableBodyBg: '#fff',     // White for table body
        borderColor: '#8a2be2',  // Purple border for table and checkboxes
        accentColor: '#8a2be2',  // Purple accent for checkboxes
        tableBoxShadow: '0 4px 8px rgba(138, 43, 226, 0.2)', // Purple box shadow
    };

    const darkMode = {
        background: '#121212', // Dark
        text: '#a78bfa',       // Light purple
        tableHeaderBg: '#a78bfa', // Light purple for table header
        tableHeaderColor: '#121212', // Dark text for table header
        tableBodyBg: '#1e1e1e', // Darker grey for table body
        borderColor: '#a78bfa',  // Light purple border for table and checkboxes
        accentColor: '#a78bfa',  // Light purple accent for checkboxes
        tableBoxShadow: '0 4px 8px rgba(167, 139, 250, 0.2)', // Light purple box shadow
    };

    const currentTheme = theme === 'light' ? lightMode : darkMode;
    const sidebarWidth = sidebarOpen ? '250px' : '0';

    return (
        <div className="container-fluid" style={{
            backgroundColor: currentTheme.background,
            color: currentTheme.text,
            minHeight: "100vh",
            display: 'flex',
            flexDirection: 'column',
            '--table-border-color': currentTheme.borderColor,
        }}>
            <Header toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex', flexGrow: 1, backgroundColor: currentTheme.background }}>
                <Sidebar isOpen={sidebarOpen} />
                <div className={`main-content p-4`} style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease-in-out', width: '100%' }}>
                    <h2 className="text-center mb-4" style={{ color: currentTheme.text }}>Scrum Board</h2>
                    <div className="table-responsive">
                    <Table
        bordered
        className="purple-bordered-table"
        style={{
            backgroundColor: currentTheme.tableBodyBg,
            borderColor: currentTheme.borderColor,
            color: currentTheme.text,
            boxShadow: currentTheme.tableBoxShadow,
            marginTop:'50px'
        }}
    >
                            <thead style={{ backgroundColor:'#8a2be2', color: 'white' }}>
                                <tr>
                                    <th>Task Name</th>
                                    <th className="text-center">To Do</th>
                                    <th className="text-center">Doing</th>
                                    <th className="text-center">Done</th>
                                    <th className="text-center">Issue Happened</th>
                                </tr>
                            </thead>
                            <tbody style={{ backgroundColor: currentTheme.tableBodyBg, color: currentTheme.text }}>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td style={{ fontWeight: 'bold' }}>{task.taskName || "Unnamed Task"}</td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={task.status === "To Do"}
                                                onChange={() => updateTaskStatus(task.id, "To Do")}
                                                style={{ accentColor: currentTheme.accentColor, height:'20px', width: ' 20px' }}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={task.status === "Doing"}
                                                onChange={() => updateTaskStatus(task.id, "Doing")}
                                                style={{ accentColor: currentTheme.accentColor, height:'20px', width: ' 20px' }}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={task.status === "Done"}
                                                onChange={() => updateTaskStatus(task.id, "Done")}
                                                style={{ accentColor: currentTheme.accentColor, height:'20px', width: ' 20px' }}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={task.status === "Issue Happened"}
                                                onChange={() => updateTaskStatus(task.id, "Issue Happened")}
                                                style={{ accentColor: currentTheme.accentColor, height:'20px', width: ' 20px' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrumBoard;
