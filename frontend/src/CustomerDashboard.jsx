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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchBookings();
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
            <p>Hier kommt bald das Formular hin, um E-Mail, Telefon und Passwort zu ändern.</p>
            {/*  Formular einfügen */}
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