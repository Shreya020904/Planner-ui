import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Container, Spinner, Alert } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { ThemeContext } from '../ThemeContext';
import imageCompression from 'browser-image-compression';

const Account = () => {
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [username, setUsername] = useState(localStorage.getItem("username") || "User");
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]); // State for other users

  const auth = getAuth();
  const db = getFirestore();

  // Theme-aware styles
  const styles = {
    card: {
      backgroundColor: theme === 'dark' ? '#f8f0fb' : '#f8f0fb',
      border: `2px solid ${theme === 'dark' ? '#9b59b6' : '#8a2be2'}`,
      maxWidth: '600px',boxShadow:'0px 4px 6px rgba(155, 89, 182, 0.5)'
    },
    textPurple: {
      color: theme === 'dark' ? '#8a2be2' : '#8a2be2'
    },
    pageContent: {
      marginLeft: isSidebarOpen ? '250px' : '0',
      transition: 'margin-left 0.3s ease',
      backgroundColor: theme === 'dark' ? '#333' : '#f5e6d9',
      minHeight: '100vh'
    },
    divider: {
      borderColor: theme === 'dark' ? '#9b59b6' : '#8a2be2',
      borderWidth: '3px',
      margin: '20px 0',
      boxShadow: theme === 'dark' 
    ? '0px 4px 6px rgba(155, 89, 182, 0.5)'  // Purple glow for dark mode
    : '0px 4px 6px rgba(138, 43, 226, 0.5)', // Lighter glow for light mode
  transition: 'box-shadow 0.3s ease-in-out'      
    }
  };

  // Fetch user data based on username from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUsername(userData.username);
          setEmail(userData.email || 'Not provided');
          setDesignation(userData.designation || 'Not specified');
          setYearsOfExperience(userData.yearsOfExperience || '0');
          setProfilePicture(userData.profilePicture || null);

          // Update localStorage if username changed
          if (userData.username !== localStorage.getItem("username")) {
            localStorage.setItem("username", userData.username);
          }
        } else {
          setError('No user found with that username');
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        //get all users except the current user.
        const q = query(usersCollection, where("username", "!=", username));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => doc.data());
        setOtherUsers(usersData);
      } catch (error) {
        console.error("Error fetching other users", error);
        setError("Failed to load other users.");
      }
    }

    if (username && username !== "User") {
      fetchUserData();
      fetchOtherUsers(); // Fetch other users
    } else {
      setLoading(false);
    }
  }, [username, db]);

  // Handle profile picture upload
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null); // Clear any previous error
      // Compress image
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);

      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);

      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Find user document reference
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;

          // Update Firestore
          await updateDoc(docRef, {
            profilePicture: base64Image,
            lastUpdated: new Date().toISOString()
          });

          // Update state
          setProfilePicture(base64Image);
          await updateProfile(auth.currentUser, { photoURL: base64Image });
        }
      };
    } catch (err) {
      setError('Image upload failed. Please try a smaller file.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return (
    <div className="d-flex" style={styles.pageContent}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-grow-1">
        <Header toggleSidebar={toggleSidebar} />
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex" style={styles.pageContent}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-grow-1">
        <Header toggleSidebar={toggleSidebar} />

        <Container fluid className="mt-4">
          <h2 className="mb-4 text-purple" style={{ color: '#8a2be2', marginTop: '100px', marginLeft: '20px' }}>Your Account</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          <Card className="shadow-custom" style={styles.card}>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center">
                  <div className="position-relative" style={{ cursor: 'pointer' }}>
                    <div
                      onClick={() => document.getElementById('profileUpload').click()}
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: `2px solid ${styles.textPurple.color}`,
                        margin: '0 auto'
                      }}
                    >
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <FaUserCircle
                          size={150}
                          color={styles.textPurple.color}
                        />
                      )}
                    </div>

                    <input
                      type="file"
                      id="profileUpload"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="d-none"
                      disabled={uploading}
                    />

                    {uploading && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <Spinner size="sm" />
                      </div>
                    )}

                    <small className="text-muted d-block mt-2">
                      {uploading ? 'Uploading...' : 'Click to change'}
                    </small>
                  </div>
                </Col>

                <Col md={8}>
                  <h4 className="mb-3" style={styles.textPurple}>
                    {username}
                  </h4>

                  <div className="mb-2">
                    <strong style={styles.textPurple}>Email:</strong>
                    <span className="ms-2">{email}</span>
                  </div>

                  <div className="mb-2">
                    <strong style={styles.textPurple}>Designation:</strong>
                    <span className="ms-2">{designation}</span>
                  </div>

                  <div>
                    <strong style={styles.textPurple}>Experience:</strong>
                    <span className="ms-2">
                      {yearsOfExperience} years
                    </span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <hr style={styles.divider} />

          <h2 className="mb-4 text-purple" style={{ color: '#8a2be2', marginLeft: '20px' }}>Other Accounts</h2>
          <Row>
            {otherUsers.map((user, index) => (
              <Col key={index} xs={12} md={6} className="mb-4"> {/* Added xs and md for responsiveness */}
                <Card className="shadow-custom" style={styles.card}>
                  <Card.Body>
                    <Row>
                      <Col md={4} className="text-center">
                        <div style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: `2px solid ${styles.textPurple.color}`,
                          margin: '0 auto'
                        }}>
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`Profile of ${user.username}`}
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <FaUserCircle
                              size={150}
                              color={styles.textPurple.color}
                            />
                          )}
                        </div>
                      </Col>
                      <Col md={8}>
                        <h4 className="mb-3" style={styles.textPurple}>{user.username}</h4>
                        <div className="mb-2">
                          <strong style={styles.textPurple}>Email:</strong>
                          <span className="ms-2">{user.email || 'Not provided'}</span>
                        </div>
                        <div className="mb-2">
                          <strong style={styles.textPurple}>Designation:</strong>
                          <span className="ms-2">{user.designation || 'Not specified'}</span>
                        </div>
                        <div>
                          <strong style={styles.textPurple}>Experience:</strong>
                          <span className="ms-2">{user.yearsOfExperience || '0'} years</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Account;
