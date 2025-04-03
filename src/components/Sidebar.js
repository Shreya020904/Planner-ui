import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    LayoutDashboard,
    MessageSquare,
    ListChecks,
    ClipboardList,
} from 'lucide-react';
import { ThemeContext } from '../ThemeContext'; // Import ThemeContext

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const { theme } = useContext(ThemeContext); // Consume the theme context

    const sidebarVariants = {
        open: {
            width: 250,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
        closed: {
            width: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
    };

    const menuItemVariants = {
        open: {
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.1,
                duration: 0.3,
            },
        },
        closed: {
            opacity: 0,
            x: -20,
            transition: {
                duration: 0.1,
            },
        },
    };

    const sidebarBackgroundColor = theme === 'dark' ? '#1a1a1a' : '#f5e6d9';
    const textColor = theme === 'dark' ? '#f8f9fa' : 'rgb(111, 35, 130)';
    const iconColor = theme === 'dark' ? '#a78bfa' : '#8a2be2'; // Slightly different purple for dark mode
    const activeBackgroundColor = theme === 'dark' ? '#333' : '#f0d9ff';
    const activeTextColor = theme === 'dark' ? '#d6adff' : 'rgb(112, 36, 131)';
    const hoverBackgroundColor = theme === 'dark' ? '#222' : '#d8b4fe';
    const activeBorderColor = theme === 'dark' ? '#a78bfa' : '#8a2be2';

    return (
        <motion.div
            className="sidebar"
            variants={sidebarVariants}
            initial={isOpen ? "open" : "closed"}
            animate={isOpen ? "open" : "closed"}
            style={{
                backgroundColor: sidebarBackgroundColor,
                position: 'fixed',
                top: '85px',
                left: 0,
                height: 'calc(100vh - 85px)',
                overflowX: 'hidden',
                zIndex: 1000,
                color: textColor, // Apply text color to the sidebar container
                borderRight: `2px solid ${activeBorderColor}`, // Right-side border
                boxShadow: `3px 0px 10px rgba(138, 43, 226, 0.6)`, // Purple shadow on the right
            }}
        >
            <Nav className="flex-column" style={{ marginTop: '20px' }}>
                <NavItem
                    to="/dashboard"
                    active={location.pathname === "/dashboard"}
                    icon={<LayoutDashboard className="mr-2" color={iconColor} />}
                    text=" Dashboard"
                    variants={menuItemVariants}
                    isOpen={isOpen}
                    textColor={textColor}
                    activeBackgroundColor={activeBackgroundColor}
                    activeTextColor={activeTextColor}
                    hoverBackgroundColor={hoverBackgroundColor}
                    activeBorderColor={activeBorderColor}
                />
                <NavItem
                    to="/chat"
                    active={location.pathname === "/chat"}
                    icon={<MessageSquare className="mr-2" color={iconColor} />}
                    text=" Chat"
                    variants={menuItemVariants}
                    isOpen={isOpen}
                    textColor={textColor}
                    activeBackgroundColor={activeBackgroundColor}
                    activeTextColor={activeTextColor}
                    hoverBackgroundColor={hoverBackgroundColor}
                    activeBorderColor={activeBorderColor}
                />
                <NavItem
                    to="/task-scheduler"
                    active={location.pathname === "/task-scheduler"}
                    icon={<ListChecks className="mr-2" color={iconColor} />}
                    text=" Task Scheduler"
                    variants={menuItemVariants}
                    isOpen={isOpen}
                    textColor={textColor}
                    activeBackgroundColor={activeBackgroundColor}
                    activeTextColor={activeTextColor}
                    hoverBackgroundColor={hoverBackgroundColor}
                    activeBorderColor={activeBorderColor}
                />
                <NavItem
                    to="/scrum-board"
                    active={location.pathname === "/scrum-board"}
                    icon={<ClipboardList className="mr-2" color={iconColor} />}
                    text=" Scrum Board"
                    variants={menuItemVariants}
                    isOpen={isOpen}
                    textColor={textColor}
                    activeBackgroundColor={activeBackgroundColor}
                    activeTextColor={activeTextColor}
                    hoverBackgroundColor={hoverBackgroundColor}
                    activeBorderColor={activeBorderColor}
                />
            </Nav>
        </motion.div>
    );
};

const NavItem = ({ to, active, icon, text, variants, isOpen, textColor, activeBackgroundColor, activeTextColor, hoverBackgroundColor, activeBorderColor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const currentTextColor = active ? activeTextColor : textColor;
    const currentBackgroundColor = active ? activeBackgroundColor : 'transparent';
    const currentBorderBottom = active ? `3px solid ${activeBorderColor}` : 'none';

    return (
        <motion.li
            className="nav-item"
            variants={variants}
            style={{
                marginBottom: '15px',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
            }}
            whileHover={{
                backgroundColor: hoverBackgroundColor,
                scale: 1.05,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                to={to}
                className={`nav-link d-flex align-items-center ${active ? "active" : ""}`}
                style={{
                    color: currentTextColor,
                    textDecoration: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: currentBackgroundColor,
                    borderBottom: currentBorderBottom,
                    position: 'relative',
                    fontWeight: 'bold'
                }}
            >
                {icon}
                <span style={{
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}>
                    {text}
                </span>
            </Link>
            {active && (
                <div
                    style={{
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        height: '3px',
                        backgroundColor: activeBorderColor,
                    }}
                />
            )}
        </motion.li>
    );
};

export default Sidebar;

