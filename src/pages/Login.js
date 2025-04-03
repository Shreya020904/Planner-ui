import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button, Form, Alert } from 'react-bootstrap';
import "./Auth.css";

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [designation, setDesignation] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                setError("Username not found!");
                return;
            }
    
            const userData = querySnapshot.docs[0].data();
            const userEmail = userData.email;
    
            await signInWithEmailAndPassword(auth, userEmail, password);
            localStorage.setItem("username", username); // Store username in localStorage
    
            navigate("/dashboard");
        } catch (error) {
            setError("Invalid username or password!");
        }
    };
    
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await addDoc(collection(db, "users"), {
                username,
                email,
                designation,
                yearsOfExperience,
                uid: userCredential.user.uid
            });
            setIsSignUp(false);
            setError("");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth-container" style={{ backgroundColor: '#f5e6d9' }}>
            <div className="auth-box" style={{
                backgroundColor: 'rgb(227, 215, 239)',
                border: '1px solid #8a2be2',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgb(186, 148, 222',
                width: '500px',
            }}>
                <div className="slider-container" style={{ display: 'flex', position: 'relative', width: '100%' }}>
                    <div className={`slider ${isSignUp ? "signup" : "login"}`} style={{
                        position: 'absolute',
                        top: 0,
                        left: isSignUp ? '5%' : '0%',
                        width: '50%',
                        height: '100%',
                        backgroundColor: '#8a2be2',
                        transition: 'left 0.6s ease',
                        borderRadius: '8px 0 0 8px',
                    }} />
                    <button
                        className={!isSignUp ? "active" : ""}
                        onClick={() => setIsSignUp(false)}
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            color: !isSignUp ? '#fff' : '#8a2be2',
                            border: 'none',
                            padding: '10px',
                            cursor: 'pointer',
                            zIndex: 1,
                            fontWeight: 'bold',
                            transition: 'color 0.3s ease',
                            borderTopLeftRadius: '8px',
                            borderBottomLeftRadius: '8px'

                        }}
                    >
                        Login
                    </button>
                    <button
                        className={isSignUp ? "active" : ""}
                        onClick={() => setIsSignUp(true)}
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            color: isSignUp ? '#fff' : '#8a2be2',
                            border: 'none',
                            padding: '10px',
                            cursor: 'pointer',
                            zIndex: 1,
                            fontWeight: 'bold',
                            transition: 'color 0.3s ease',
                            borderTopRightRadius: '8px',
                            borderBottomRightRadius: '8px'
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {isSignUp ? (
                    <Form className="form-container" onSubmit={handleSignup} style={{ padding: '20px' }}>
                        <h2 className="heading" style={{ color: '#8a2be2' }}>Sign Up</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group controlId="formBasicUsername" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicEmail" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicDesignation" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Designation"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicYearsOfExperience" className="mb-3">
                            <Form.Control
                                type="number"
                                placeholder="Years of Experience"
                                value={yearsOfExperience}
                                onChange={(e) => setYearsOfExperience(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            style={{ backgroundColor: '#8a2be2', borderColor: '#8a2be2', width: '100%' }}
                        >
                            Sign Up
                        </Button>
                    </Form>
                ) : (
                    <Form className="form-container" onSubmit={handleLogin} style={{ padding: '20px' }}>
                        <h2 className="heading" style={{ color: '#8a2be2' }}>Login</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group controlId="formBasicUsername" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBasicPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ backgroundColor: '#f8f9fa', borderColor: '#8a2be2' }}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            style={{ backgroundColor: '#8a2be2', borderColor: '#8a2be2', width: '100%' }}
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default Login;
