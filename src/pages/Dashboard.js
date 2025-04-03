import React, { useEffect, useState, useContext } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ThemeContext } from '../ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const Dashboard = () => {
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

    const lightMode = {
        background: '#f5e6d9',
        text: '#4b0082',
        cardBg: '#fff',
        cardTitleText: '#4b0082',
        cardTitleBg: '#d6adff',
        cardTitleBorderBottom: '#800080', // Dark Purple
        chartText: '#555',
        doneColor: '#4caf50',
        notDoneColor: '#f44336',
        todoColor: '#fdd835',
        doingColor: '#2196f3',
        issueColor: '#ff9800',
    };

    const darkMode = {
        background: '#121212',
        text: '#a78bfa',
        cardBg: '#fff',
        cardTitleText: '#4b0082',
        cardTitleBg: '#d6adff',
        cardTitleBorderBottom: '#800080', // Dark Purple
        chartText: '#555',
        doneColor: '#8bc34a',
        notDoneColor: '#f48fb1',
        todoColor: '#fbc02d',
        doingColor: '#64b5f6',
        issueColor: '#ffb74d',
    };

    const currentTheme = theme === 'light' ? lightMode : darkMode;
    const sidebarWidth = sidebarOpen ? '250px' : '0';

    // --- Analysis and Metrics ---
    const statusCounts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {});
    const todoTasksCount = statusCounts['To Do'] || 0;
    const doingTasksCount = statusCounts['Doing'] || 0;
    const doneTasksCount = statusCounts['Done'] || 0;

    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    const statusColors = statusLabels.map(label => {
        if (label === 'Done') return currentTheme.doneColor;
        if (label === 'To Do') return currentTheme.todoColor;
        if (label === 'Doing') return currentTheme.doingColor;
        if (label === 'Issue Happened') return currentTheme.issueColor;
        return '#808080'; // Default color
    });

    const statusChartData = {
        labels: statusLabels,
        datasets: [{
            label: 'Task Status',
            data: statusData,
            backgroundColor: statusColors,
            borderWidth: 1,
        }],
    };
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: currentTheme.chartText,
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed;
                        }
                        return label;
                    }
                }
            }
        }
    };

    const typeCounts = tasks.reduce((acc, task) => {
        if (task.taskType) {
            acc[task.taskType] = (acc[task.taskType] || 0) + 1;
        }
        return acc;
    }, {});
    const typeLabels = Object.keys(typeCounts);
    const typeData = Object.values(typeCounts);
    const typeColors = ['#4bc0c0', '#9966ff', '#c9cbcf', '#ffeb3b', '#f44336'];
    const typeChartData = {
        indexAxis: 'y',
        labels: typeLabels,
        datasets: [{
            label: 'Task Type',
            data: typeData,
            backgroundColor: typeColors,
            borderWidth: 1,
        }],
    };
    const typeChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        scales: {
            x: {
                ticks: {
                    color: currentTheme.chartText,
                },
            },
            y: {
                ticks: {
                    color: currentTheme.chartText,
                },
            },
        }
    };

    const totalTasks = tasks.length;
    const donePercentage = totalTasks > 0 ? (doneTasksCount / totalTasks) * 100 : 0;
    const notDonePercentage = 100 - donePercentage;
    const doneChartData = {
        labels: ['Done', 'Not Done'],
        datasets: [{
            label: 'Percentage of Tasks Done',
            data: [donePercentage, notDonePercentage],
            backgroundColor: [currentTheme.doneColor, currentTheme.notDoneColor],
            borderWidth: 1,
        }],
    };
    const doneChartOptions = {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, max: 100, ticks: { callback: value => value + '%', color: currentTheme.chartText } },
            y: { ticks: { color: currentTheme.chartText } }
        }
    };

    const totalTasksCount = tasks.length;
    const openTasksCount = tasks.filter(task => task.status !== 'Done').length;
    const issueTasksCount = tasks.filter(task => task.status === 'Issue Happened').length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const tasksCreatedData = last7Days.map(() => Math.floor(Math.random() * 10));
    const tasksCreatedChartData = {
        labels: last7Days,
        datasets: [{
            label: 'Tasks Created Last 7 Days',
            data: tasksCreatedData,
            fill: false,
            borderColor: '#9c27b0',
            tension: 0.3,
        }],
    };
    const tasksCreatedChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: currentTheme.chartText } },
            y: { ticks: { color: currentTheme.chartText } }
        }
    };

    const teamMembers = ['Alice', 'Bob', 'Charlie', 'David'];
    const performanceData = teamMembers.map(() => Math.floor(Math.random() * 20) + 5);
    const performanceChartData = {
        indexAxis: 'y',
        labels: teamMembers,
        datasets: [{
            label: 'Team Performance Score',
            data: performanceData,
            backgroundColor: ['#00bcd4', '#8e24aa', '#689f38', '#d84315'],
            borderWidth: 1,
        }],
    };
    const performanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, ticks: { color: currentTheme.chartText } },
            y: { ticks: { color: currentTheme.chartText } }
        }
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: currentTheme.background, color: currentTheme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column', marginTop: '85px' }}>
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content d-flex" style={{ flexGrow: 1, backgroundColor: currentTheme.background }}>
                <Sidebar isOpen={sidebarOpen} />
                <main className="dashboard-main p-4" style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease-in-out', width: '100%' }}>
                    <h2 className="mb-4" style={{ height: '65px', color: currentTheme.text, textAlign: 'left', borderBottom: `2px solid ${currentTheme.cardTitleBorderBottom}`, boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.1)' }}>
                        Dashboard
                    </h2>

                    <div className="row mb-4">
                        {/* Left Side - Task Summary and Financial Metrics */}
                        <div className="col-md-8">
                            <div className="row">
                                {/* Task Status Summary */}
                                <div className="col-md-6">
                                    <div className="card metric-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text }}>
                                        <div className="card-body">
                                            <h5 className="card-title" style={{ width: '100%', height: '30px', color: currentTheme.cardTitleText, backgroundColor: currentTheme.cardTitleBg, textAlign: 'center', borderBottom: `3px solid ${currentTheme.cardTitleBorderBottom}` }}>Task Status Summary</h5>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-hover" style={{ color: currentTheme.text, border: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ borderBottom: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>Status</th>
                                                            <th style={{ borderBottom: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>Count</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ borderBottom: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>To Do</td>
                                                            <td style={{ borderBottom: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>{todoTasksCount}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ borderBottom: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>Doing</td>
                                                            <td style={{ borderBottom: `1px solid ${currentTheme.cardTitleBorderBottom}` }}>{doingTasksCount}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Done</td>
                                                            <td>{doneTasksCount}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Metrics */}
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card metric-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text }}>
                                                <div className="card-body">
                                                    <h5 className="card-title" style={{ color: currentTheme.cardTitleText }}>Money</h5>
                                                    <p className="card-text">Amount: $10,000</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card metric-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text }}>
                                                <div className="card-body">
                                                    <h5 className="card-title" style={{ color: currentTheme.cardTitleText }}>Profits</h5>
                                                    <p className="card-text">Profit: $5,000</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-md-6">
                                            <div className="card metric-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text }}>
                                                <div className="card-body">
                                                    <h5 className="card-title" style={{ color: currentTheme.cardTitleText }}>Project Budget</h5>
                                                    <p className="card-text">Budget: $2,000</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card metric-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.text }}>
                                                <div className="card-body">
                                                    <h5 className="card-title" style={{ color: currentTheme.cardTitleText }}>Mitigated</h5>
                                                    <p className="card-text">Mitigated: 75%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Task Status Breakdown (Pie Chart) */}
                        <div className="col-md-4">
        <div className="card chart-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.chartText }}>
            <div className="card-body" style={{ height: '350px', position: 'relative', height:'300px' }}>
                <h5 className="card-title" style={{ width: '100%', height: '30px', color: currentTheme.cardTitleText, backgroundColor: currentTheme.cardTitleBg, textAlign: 'center', borderBottom: `3px solid ${currentTheme.cardTitleBorderBottom}`}}>Task Status Breakdown</h5>
                <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, bottom: 50, height: '250px',marginTop:'20px' }}>
                    {statusLabels.length > 0 ? <Pie data={statusChartData} options={pieChartOptions} /> : <p>No status data available.</p>}
                </div>
            </div>
        </div>
    </div>
</div>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card chart-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.chartText }}>
                                <div className="card-body" style={{ height: '350px' }}>
                                    <h5 className="card-title" style={{ width: '100%', height: '30px', color: currentTheme.cardTitleText, backgroundColor: currentTheme.cardTitleBg, textAlign: 'center', borderBottom: `3px solid ${currentTheme.cardTitleBorderBottom}` }}>Hypothetical Team Performance</h5>
                                    <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, bottom: 50, height: '300px',marginTop:'20px' }}>
                                      <Bar data={performanceChartData} options={performanceChartOptions} />
                                      </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card chart-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.chartText }}>
                                <div className="card-body" style={{ height: '350px' }}>
                                    <h5 className="card-title" style={{ width: '100%', height: '30px', color: currentTheme.cardTitleText, backgroundColor: currentTheme.cardTitleBg, textAlign: 'center', borderBottom: `3px solid ${currentTheme.cardTitleBorderBottom}` }}>Task Type Breakdown</h5>
                                    <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, bottom: 50, height: '300px',marginTop:'20px' }}>
                                      {typeLabels.length > 0 ? <Bar data={typeChartData} options={typeChartOptions} /> : <p>No type data available.</p>}
                                      </div></div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card chart-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.chartText }}>
                                <div className="card-body" style={{ height: '300px' }}>
                                    <h5 className="card-title" style={{ width: '100%', height: '30px', color: currentTheme.cardTitleText, backgroundColor: currentTheme.cardTitleBg, textAlign: 'center', borderBottom: `3px solid ${currentTheme.cardTitleBorderBottom}` }}>Percentage of Tasks Done</h5>
                                    <div style={{ height: '200px' }}>
                                        <Bar data={doneChartData} options={doneChartOptions} />
                                    </div>
                                    <p className="mt-2"><strong>Done:</strong> {donePercentage.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card chart-card" style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.chartText }}>
                                <div className="card-body" style={{ height: '300px' }}>
                                    <h5 className="card-title" style={{ width: '100%', height: '30px', color: currentTheme.cardTitleText, backgroundColor: currentTheme.cardTitleBg, textAlign: 'center', borderBottom: `3px solid ${currentTheme.cardTitleBorderBottom}` }}>Tasks Created Last 7 Days</h5>
                                    <div style={{height:'250px'}}><Line data={tasksCreatedChartData} options={tasksCreatedChartOptions} />
                                    </div></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

