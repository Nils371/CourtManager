import {use, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import './OwnerDashboard.css';
import {FaTrashAlt} from "react-icons/fa";

function OwnerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('schedule');

    const [facilityBookings, setFacilityBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [courts, setCourts] = useState([]);

    const [showNewCourtForm, setShowNewCourtForm] = useState(false);
    const [newCourt, setNewCourt] = useState({name: '', isIndoor: '', hourlyRate: ''});

    const [isEditingFacility, setIsEditingFacility] = useState(false);
    const [editFacility, setEditFacility] = useState(null);

    const [message, setMessage] = useState({ type: '', text: ''});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchFacilities = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/facilities/my', {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setFacilities(response.data);

                if (response.data.length > 0) {
                    const firstFacility = response.data[0];
                    setSelectedFacility(firstFacility);
                    fetchCourts(firstFacility.id);
                    fetchFacilityBookings(firstFacility.id);
                }
            } catch (error) {
                setMessage({type: 'error', text: 'Anlagen konnten nicht geladen werden'});
            }
        };

        fetchFacilities();
    }, [navigate]);

    useEffect(() => {
        if (selectedFacility) {
            setEditFacility({...selectedFacility});
        }
    }, [selectedFacility]);

    const fetchCourts = async (facilityId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/facilities/${facilityId}/courts`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCourts(response.data);
        } catch (error) {
            setMessage({type: 'error', text: 'Courts der ausgewählten Anlage konnten nicht geladen werden'});
        }
    }

    const fetchFacilityBookings = async (facilityId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/bookings/facility/${facilityId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            const allBookings = response.data;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            const filtered = allBookings.filter(booking => {
                const bookingDate = new Date(booking.startTime);
                return booking.status !== 'CANCELLED' && bookingDate >= today && bookingDate <= nextWeek;
            });

            filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setFacilityBookings(filtered);
        } catch (error) {
            setMessage({type: 'error', text: 'Die Buchungen der ausgewählten Anlage konnten nicht geladen werden'});
        }
    }

    const handleConfirmPayment = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`http://localhost:8080/api/bookings/${bookingId}/mark-paid`, {}, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setFacilityBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.id === bookingId ? {...booking, isPaid: true} : booking
                )
            );

            setSelectedBooking(prevBooking => prevBooking && prevBooking.id === bookingId ? {...prevBooking, isPaid: true} : prevBooking);
        } catch (error) {
            setMessage({type: 'error', text: 'Die Zahlung konnte nicht bestätigt werden'});
        }
    };

    const handleCreateCourt = async (e) => {
        e.preventDefault();
        setMessage({type: '' , text: ''})

        try{
            const token = localStorage.getItem('token');
            const payload = {
                facilityId: selectedFacility.id,
                name: newCourt.name,
                isIndoor: newCourt.isIndoor,
                hourlyRate: parseFloat(newCourt.hourlyRate.replace(',', '.'))
            };
            const response = await axios.post('http://localhost:8080/api/courts', payload, {
                headers: {Authorization: `Bearer ${token}`}
            })

            setCourts([...courts, response.data]);
            setShowNewCourtForm(false);
            setNewCourt({ name: '', isIndoor: false, hourlyRate: '' });
            setMessage({ type: 'success', text: 'Neuer Platz erfolgreich angelegt!' });
        } catch(error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Erstellen des Platzes"
            setMessage({type: 'error', text: errorMsg});
        }
    }

    const handleCancelEditFacility = () => {
        setEditFacility({...selectedFacility});
        setIsEditingFacility(false);
        setMessage({type: '', text: ''});
    };

    const handleUpdateFacility = async (e) => {
        e.preventDefault();
        setMessage({type: '' , text: ''})

        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: editFacility.name,
                openingTime: editFacility.openingTime,
                closingTime: editFacility.closingTime,
                hasShower: editFacility.hasShower,
                hasChangingRoom: editFacility.hasChangingRoom,
                hasToilet: editFacility.hasToilet,
                hasSnackBar: editFacility.hasSnackBar
            };

            const response = await axios.put(`http://localhost:8080/api/facilities/${selectedFacility.id}`, payload, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setSelectedFacility(response.data);
            setEditFacility(response.data);
            setFacilities(prevFacilities =>
                prevFacilities.map(facility => facility.id === selectedFacility.id ? response.data : facility)
            );
            setIsEditingFacility(false);

            setMessage({ type: 'success', text: 'Anlage erfolgreich aktualisiert!' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Aktualisieren der Anlage"
            setMessage({type: 'error', text: errorMsg});
        }
    };

    const handleDeleteCourt = async (courtId) => {
        if (!window.confirm("Bist du sicher, dass du diesen Platz löschen möchtest?")) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/courts/${courtId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setCourts(prevCourts => prevCourts.filter(court => court.id !== courtId));
            setMessage({ type: 'success', text: 'Platz erfolgreich gelöscht!' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Löschen des Platzes"
            setMessage({type: 'error', text: errorMsg});
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const renderSettingsTab = () => (
        <div className="settings-wrapper">
            {!editFacility ? (
                "Lade Daten..."
            ) : !isEditingFacility ? (
                /* --- LESE-MODUS --- */
                <div className="settings-section">
                    <div className="settings-info">
                        <div className="info-group full-width">
                            <label>Name der Anlage</label>
                            <p className="fw-500">{selectedFacility?.name}</p>
                        </div>
                        <div className="info-group half-width">
                            <label>Öffnungszeiten</label>
                            <p>
                                {formatTime(selectedFacility?.openingTime)} - {formatTime(selectedFacility?.closingTime)} Uhr
                            </p>
                        </div>
                        <div className="info-group full-width">
                            <label className="mb-8">Ausstattung</label>
                            <div className="amenities-container">
                                {selectedFacility?.hasShower && <span>🚿 Dusche</span>}
                                {selectedFacility?.hasChangingRoom && <span>👕 Umkleide</span>}
                                {selectedFacility?.hasToilet && <span>🚽 Toilette</span>}
                                {selectedFacility?.hasSnackBar && <span>☕ Snackbar</span>}
                                {!selectedFacility?.hasShower && !selectedFacility?.hasChangingRoom && !selectedFacility?.hasToilet && !selectedFacility?.hasSnackBar && (
                                    <span className="text-muted">Keine spezielle Ausstattung angegeben</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => setIsEditingFacility(true)}>
                        Daten bearbeiten
                    </button>
                </div>
            ) : (
                /* --- BEARBEITUNGS-MODUS --- */
                <div className="settings-section">
                    <h3 className="section-title">Anlagendaten bearbeiten</h3>

                    <form onSubmit={handleUpdateFacility} className="settings-form">
                        <div className="form-group form-row-full">
                            <label htmlFor="facilityName">Name der Anlage:</label>
                            <input type="text" id="facilityName" className="input-field"
                                   value={editFacility.name || ''} onChange={(e) => setEditFacility({...editFacility, name: e.target.value})} required />
                        </div>

                        <div className="form-row-split">
                            <div className="form-group form-col">
                                <label htmlFor="openingTime">Öffnungszeit:</label>
                                <input type="time" id="openingTime" className="input-field"
                                       value={formatTime(editFacility.openingTime)}
                                       onChange={(e) => setEditFacility({...editFacility, openingTime: e.target.value})} required />
                            </div>
                            <div className="form-group form-col">
                                <label htmlFor="closingTime">Schließzeit:</label>
                                <input type="time" id="closingTime" className="input-field"
                                       value={formatTime(editFacility.closingTime)}
                                       onChange={(e) => setEditFacility({...editFacility, closingTime: e.target.value})} required />
                            </div>
                        </div>

                        <div className="form-checkbox-group">
                            <label className="form-checkbox-label-main">Ausstattung:</label>

                            <div className="form-checkbox-container">
                                <label className="form-checkbox-item">
                                    <input type="checkbox" checked={!!editFacility.hasShower} onChange={(e) => setEditFacility({...editFacility, hasShower: e.target.checked})} />
                                    Dusche
                                </label>
                                <label className="form-checkbox-item">
                                    <input type="checkbox" checked={!!editFacility.hasChangingRoom} onChange={(e) => setEditFacility({...editFacility, hasChangingRoom: e.target.checked})} />
                                    Umkleide
                                </label>
                                <label className="form-checkbox-item">
                                    <input type="checkbox" checked={!!editFacility.hasToilet} onChange={(e) => setEditFacility({...editFacility, hasToilet: e.target.checked})} />
                                    Toilette
                                </label>
                                <label className="form-checkbox-item">
                                    <input type="checkbox" checked={!!editFacility.hasSnackBar} onChange={(e) => setEditFacility({...editFacility, hasSnackBar: e.target.checked})} />
                                    Snackbar
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={handleCancelEditFacility}>
                                Abbrechen
                            </button>
                            <button type="submit" className="btn-primary">
                                Änderungen speichern
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );

    const renderScheduleTab = () => {
        const totalRevenue = facilityBookings.reduce((sum, booking) => sum + (booking.isPaid ? booking.totalPrice : 0), 0);

        return(
            <div className="tab-content">
                <div className="dashboard-header">
                    <h2>Wochenplan der Anlage: {selectedFacility?.name}</h2>
                </div>

                <div style={{ marginTop: '20px' }}>
                    {facilityBookings.length === 0 ? (
                        <p>Keine Buchungen für die nächsten 7 Tage.</p>
                    ) : (
                        <table className="bookings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                            <tr style={{ borderBottom: '2px solid #e5e5ea' }}>
                                <th style={{ padding: '12px' }}>Datum & Uhrzeit</th>
                                <th style={{ padding: '12px' }}>Platz</th>
                                <th style={{ padding: '12px' }}>Kunde</th>
                                <th style={{ padding: '12px' }}>Zahlung</th>
                            </tr>
                            </thead>
                            <tbody>
                            {facilityBookings.map(booking => {
                                const startTime = new Date(booking.startTime);
                                return (
                                    <tr
                                        key={booking.id}
                                        onClick={() => setSelectedBooking(booking)}
                                        style={{ borderBottom: '1px solid #e5e5ea', cursor: 'pointer' }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '12px' }}>
                                            {startTime.toLocaleDateString("de-DE", { weekday: 'short', day: '2-digit', month: '2-digit' })} | {startTime.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} Uhr
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{booking.courtName}</td>
                                        <td style={{ padding: '12px' }}>{booking.customerName}</td>
                                        <td style={{ padding: '12px' }}>
                                            {booking.isPaid ? '✅ Bezahlt' : '❌ Offen'}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot>
                                <tr style={{ textAlign: 'start', borderTop: '2px solid #e5e5ea', backgroundColor: '#f8f8f8' }}>
                                    <th colSpan={3} style={{ padding: '12px', fontWeight: 'bold' }}>
                                        Gesamtumsatz (bezahlt) der nächsten 7 Tage:
                                    </th>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1c1c1e', fontSize: '1.1rem' }}>
                                        {Number(totalRevenue).toFixed(2)} €
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {selectedBooking && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3 style={{ marginTop: 0 }}>Buchungsdetails</h3>
                            <p><strong>Datum & Uhrzeit:</strong> {new Date(selectedBooking.startTime).toLocaleString("de-DE")}</p>
                            <p><strong>Platz:</strong> {selectedBooking.courtName}</p>
                            <p><strong>Kunde:</strong> {selectedBooking.customerName}</p>
                            <p><strong>E-Mail:</strong> {selectedBooking.customerEmail}</p>
                            <p><strong>Telefon:</strong> {selectedBooking.customerPhone ||
                                <span style={{ color: '#888', fontStyle: 'italic' }}>Nicht angegeben</span>}</p>
                            <p><strong>Status:</strong> {selectedBooking.status}</p>
                            <p><strong>Preis:</strong> {Number(selectedBooking.totalPrice).toFixed(2)} €</p>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button className="btn-secondary" onClick={() => setSelectedBooking(null)}>Schließen</button>
                                {!selectedBooking.isPaid && (
                                    <button className="btn-primary"
                                            onClick={() => handleConfirmPayment(selectedBooking.id)}>
                                        Zahlung bestätigen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCourtsTab = () => (
        <div className="tab-content">
            <div className="dashboard-header">
                <h2>Plätze der Anlage: {selectedFacility?.name}</h2>

                {!showNewCourtForm && (
                    <button className="btn-primary" onClick={() => setShowNewCourtForm(true)}>
                        + Neuen Platz anlegen
                    </button>
                )}
            </div>

            {showNewCourtForm && (
                <div className="settings-section">
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Neuen Platz erstellen</h3>

                    <form onSubmit={handleCreateCourt} className="settings-form">
                        <div className="form-group">
                            <label>Platzname</label>
                            <input type="text" placeholder="z.B. Court 1" className="input-field"
                                   value={newCourt.name} onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                                   required minLength="2" maxLength="30" />
                        </div>

                        <div className="form-group">
                            <label>Preis pro Stunde (€)</label>
                            <input type="number" step="0.01" min="0" max="500" placeholder="25.00" className="input-field"
                                   value={newCourt.hourlyRate} onChange={(e) => setNewCourt({...newCourt, hourlyRate: e.target.value})}
                                   required />
                        </div>

                        <div className="form-group" style={{ justifyContent: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '28px' }}>
                                <input type="checkbox" checked={newCourt.isIndoor}
                                       onChange={(e) => setNewCourt({...newCourt, isIndoor: e.target.checked})}
                                       style={{ width: '18px', height: '18px' }} />
                                Ist Indoor-Platz
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowNewCourtForm(false)}>Abbrechen</button>
                            <button type="submit" className="btn-primary">Platz speichern</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '20px' }}>Deine bestehenden Plätze</h3>

                <div className="courts-grid">
                    {courts.map(court => (
                        <div key={court.id} className="court-card">
                            <div className="court-info">
                                <div className='court-header'>
                                    <h3>{court.name}</h3>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteCourt(court.id)}
                                        aria-label="Platz löschen"
                                        title = "Platz löschen"
                                    >
                                        <FaTrashAlt size={17} />
                                    </button>
                                </div>
                                <p>
                                    <strong>Preis pro Stunde:</strong> {Number(court.hourlyRate).toFixed(2)} € <br />
                                    <strong>Typ:</strong> {court.isIndoor ? 'Indoor 🏠' : 'Outdoor ☀️'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* LINKE SPALTE: Sidebar */}
            <aside className="dashboard-sidebar">
                <h2>Betreiber-Bereich</h2>
                <nav>
                    <button
                        className={`sidebar-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        Wochenplan
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'courts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courts')}
                    >
                        Platzverwaltung
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Einstellungen
                    </button>
                </nav>
                <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                    Abmelden
                </button>
            </aside>

            {/* RECHTE SPALTE: Hauptinhalt */}
            <main className="dashboard-main">
                {activeTab === 'courts' ? renderCourtsTab() : activeTab === 'settings' ? renderSettingsTab() : renderScheduleTab()}
            </main>
        </div>
    );
}
export default OwnerDashboard;