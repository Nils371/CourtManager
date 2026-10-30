import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';

function CustomerDashboard() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) >= new Date());
    const pastBookings = bookings.filter(b => new Date(b.startTime) < new Date());
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({firstName: '', lastName: '', email: '', phone: ''});
    const [passwordData, setPasswordData] = useState({oldPassword: '', newPassword: ''});
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [originalProfileData, setOriginalProfileData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/bookings/my', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const sortedBookings = response.data.sort((a, b) =>
                new Date(a.startTime) - new Date(b.startTime)
            );
            setBookings(sortedBookings);
        } catch (error) {
            setErrorMessage("Buchungen konnten nicht geladen werden.");
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/users/me', {
                headers: {Authorization: `Bearer ${token}`}
            });
            setProfileData(response.data);
            setOriginalProfileData(response.data);
        } catch (error) {
            console.error("Fehler beim Laden des Profils", error)
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchBookings();
        fetchUserProfile();
    }, [navigate]);

    const handleCancelBooking = async (bookingId) => {
        setErrorMessage("");
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBookings(prevBookings => prevBookings.map(b =>
                b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
            ));
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Fehler beim Stornieren der Buchung.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/users/me', profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
            setIsEditingProfile(false);
            setOriginalProfileData(profileData);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Speichern des Profils.";
            setProfileMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setProfileData(originalProfileData);
        setProfileMessage({ type: '', text: '' });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage({type: '', text: ''})

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/users/me/password', passwordData, {
                headers: { Authorization: `Bearer ${token}`}
            });
            setPasswordMessage({type: 'success', text: 'Passwort erfolgreich aktualisiert!'});
            setPasswordData({oldPassword: '', newPassword: ''});
        } catch(error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Speichern des Passworts";
            setPasswordMessage({type: 'error', text: errorMsg});
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({...profileData, [e.targetName]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const renderBookingsTab = () => (
        <div className="tab-content">
            <h2>Meine Buchungen</h2>
            {errorMessage && <div className="error-banner">⚠️ {errorMessage}</div>}

            {bookings.length === 0 ? (
                <p>Du hast noch keine Buchungen getätigt.</p>
            ) : (
                <>
                    <h3>Anstehende Buchungen</h3>
                    <div className="bookings-list" style={{ marginBottom: '32px' }}>
                        {upcomingBookings.length === 0 ? <p>Keine anstehenden Termine.</p> : upcomingBookings.map(booking => {
                            const startDate = new Date(booking.startTime);
                            const endDate = new Date(booking.endTime);
                            const isPast = startDate < new Date();
                            const isCancelled = booking.status === 'CANCELLED';

                            return (
                                <div key={booking.id} className={`booking-card ${isCancelled ? 'cancelled' : ''}`}>
                                    <div className="booking-info">
                                        <h3>{booking.courtName}</h3>
                                        <p>
                                            <strong>Datum:</strong> {startDate.toLocaleDateString("de-DE")} <br />
                                            <strong>Uhrzeit:</strong> {startDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} Uhr <br />
                                            <strong>Preis:</strong> {booking.totalPrice} €
                                        </p>
                                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                    </div>
                                    <div className="booking-actions">
                                        {!isCancelled && !isPast && (
                                            <button
                                                className="cancel-btn"
                                                onClick={() => {
                                                    if(window.confirm('Möchtest du diese Buchung wirklich stornieren?')) {
                                                        handleCancelBooking(booking.id);
                                                    }
                                                }}
                                            >
                                                Stornieren
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <h3>Vergangene Buchungen</h3>
                    <div className="bookings-list">
                        {pastBookings.length === 0 ? <p>Keine vergangenen Termine.</p> : pastBookings.map(booking => {
                            const startDate = new Date(booking.startTime);
                            const endDate = new Date(booking.endTime);
                            const isCancelled = booking.status === 'CANCELLED';

                            return (
                                <div key={booking.id} className={`booking-card ${isCancelled ? 'cancelled' : ''}`}>
                                    <div className="booking-info">
                                        <h3>{booking.courtName}</h3>
                                        <p>
                                            <strong>Datum:</strong> {startDate.toLocaleDateString("de-DE")} <br />
                                            <strong>Uhrzeit:</strong> {startDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} Uhr <br />
                                            <strong>Preis:</strong> {booking.totalPrice} €
                                        </p>
                                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );

    const renderProfileTab = () => (
        <div className="tab-content">
            <h2>Kontoeinstellungen</h2>

            {/* FORMULAR 1: PERSÖNLICHE DATEN */}
            <div className="settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Persönliche Daten</h3>

                    {!isEditingProfile && (
                        <button
                            className="edit-profile-btn"
                            onClick={() => setIsEditingProfile(true)}
                        >
                            Kundendaten ändern
                        </button>
                    )}
                </div>

                {profileMessage.text && (
                    <div className={`feedback-banner ${profileMessage.type}`}>
                        {profileMessage.type === 'success' ? '✅' : '⚠️'} {profileMessage.text}
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="settings-form">
                    <div className="form-group">
                        <label>Vorname</label>
                        <input type="text" name="firstName" className="input-field"
                               value={profileData.firstName} onChange={handleProfileChange}
                               disabled={!isEditingProfile} required />
                    </div>
                    <div className="form-group">
                        <label>Nachname</label>
                        <input type="text" name="lastName" className="input-field"
                               value={profileData.lastName} onChange={handleProfileChange}
                               disabled={!isEditingProfile} required />
                    </div>
                    <div className="form-group">
                        <label>E-Mail (Login)</label>
                        <input type="email" name="email" className="input-field"
                               value={profileData.email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Telefonnummer</label>
                        <input type="tel" name="phone" className="input-field"
                               value={profileData.phone} onChange={handleProfileChange}
                               disabled={!isEditingProfile} />
                    </div>

                    {isEditingProfile && (
                        <div className="form-actions">
                            <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>Abbrechen</button>
                            <button type="submit" className="save-btn">Änderungen speichern</button>
                        </div>
                    )}
                </form>
            </div>

            <hr className="divider" />

            {/* FORMULAR 2: PASSWORT ÄNDERN */}
            <div className="settings-section">
                <h3>Passwort ändern</h3>

                {passwordMessage.text && (
                    <div className={`feedback-banner ${passwordMessage.type}`}>
                        {passwordMessage.type === 'success' ? '✅' : '⚠️'} {passwordMessage.text}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="settings-form">
                    <div className="form-group full-width">
                        <label>Aktuelles Passwort</label>
                        <input type="password" name="oldPassword" className="input-field"
                               value={passwordData.oldPassword} onChange={handlePasswordChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label>Neues Passwort</label>
                        <input type="password" name="newPassword" className="input-field"
                               value={passwordData.newPassword} onChange={handlePasswordChange}
                               minLength="8" required />
                    </div>
                    <button type="submit" className="save-btn">Passwort ändern</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <h2>Mein Konto</h2>
                <nav>
                    <button
                        className={activeTab === 'bookings' ? 'active' : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        Meine Buchungen
                    </button>
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profil & Einstellungen
                    </button>
                </nav>
                <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
            </aside>

            <main className="dashboard-main">
                {activeTab === 'bookings' ? renderBookingsTab() : renderProfileTab()}
            </main>
        </div>
    );
}
export default CustomerDashboard;