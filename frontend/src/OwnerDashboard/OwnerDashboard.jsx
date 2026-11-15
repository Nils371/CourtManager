import {use, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import './OwnerDashboard.css';
import {FaTrashAlt} from "react-icons/fa";
import FacilitySettings from "./FacilitySettings.jsx";
import FacilitySchedule from "./FacilitySchedule.jsx";

function OwnerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('schedule');

    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [courts, setCourts] = useState([]);

    const [showNewCourtForm, setShowNewCourtForm] = useState(false);
    const [newCourt, setNewCourt] = useState({name: '', isIndoor: '', hourlyRate: ''});

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
                }
            } catch (error) {
                setMessage({type: 'error', text: 'Anlagen konnten nicht geladen werden'});
            }
        };

        fetchFacilities();
    }, [navigate]);


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

    const handleOnFacilityUpdated = (updatedFacility) => {
        setSelectedFacility(updatedFacility);
        setFacilities(prevFacilities => prevFacilities.map(facility => facility.id === updatedFacility.id ? updatedFacility : facility));
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
                {activeTab === 'courts' ? renderCourtsTab() : activeTab === 'settings' ? <FacilitySettings facility={selectedFacility} onFacilityUpdated ={handleOnFacilityUpdated}/> : <FacilitySchedule facility={selectedFacility}/>}
            </main>
        </div>
    );
}
export default OwnerDashboard;