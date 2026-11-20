import { useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import './OwnerDashboard.css';
import FacilityManagement from "./FacilityManagement.jsx";
import FacilitySchedule from "./FacilitySchedule.jsx";
import CourtManagement from "./CourtManagement.jsx";

function OwnerDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('schedule');
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [message, setMessage] = useState({ type: '', text: ''});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchFacilities = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:8080/api/facilities/my', {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setFacilities(response.data);

                if (response.data.length > 0) {
                    const firstFacility = response.data[0];
                    setSelectedFacility(firstFacility);
                }
            } catch (error) {
                setMessage({type: 'error', text: 'Anlagen konnten nicht geladen werden'});
            } finally {
                setIsLoading(false);
            }
        };

        fetchFacilities();
    }, [navigate]);


    const handleOnFacilityUpdated = (updatedFacility) => {
        setSelectedFacility(updatedFacility);
        setFacilities(prevFacilities => prevFacilities.map(facility => facility.id === updatedFacility.id ? updatedFacility : facility));
    };


    return (
        <div className="dashboard-container">
            {/* LINKE SPALTE: Sidebar */}
            <aside className="dashboard-sidebar">
                <h2>Betreiber-Bereich</h2>
                {facilities.length > 1 && (
                    <select
                        value={selectedFacility ? selectedFacility.id : ''}
                        onChange={(e) => {
                            const facilityId = e.target.value;
                            const facility = facilities.find(facility => facility.id === Number(facilityId));
                            setSelectedFacility(facility);
                        }}
                    >
                        {facilities.map(facility => (
                            <option
                                key={facility.id}
                                value={facility.id}
                            >
                                {facility.name}
                            </option>
                        ))}
                    </select>
                )}
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
                        Anlagenverwaltung
                    </button>
                </nav>
                <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                    Abmelden
                </button>
            </aside>

            {/* RECHTE SPALTE: Hauptinhalt */}
            <main className="dashboard-main">
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                {isLoading ? (
                    <div className="loading">Laden...</div>
                ) : (
                    <>
                        {selectedFacility ? (
                            <>
                                {activeTab === 'schedule' && (
                                    <FacilitySchedule facility={selectedFacility} />
                                )}
                                {activeTab === 'courts' && (
                                    <CourtManagement facility={selectedFacility} />
                                )}
                                {activeTab === 'settings' && (
                                    <FacilityManagement facility={selectedFacility} onFacilityUpdated={handleOnFacilityUpdated} />
                                )}
                            </>
                        ) : (
                            <div className="no-facility-message">
                                Keine Anlage gefunden. Bitte erstellen Sie eine Anlage, um fortzufahren.
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
export default OwnerDashboard;