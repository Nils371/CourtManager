import { useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import './OwnerDashboard.css';
import FacilitySettings from "./FacilitySettings.jsx";
import FacilitySchedule from "./FacilitySchedule.jsx";
import CourtManagement from "./CourtManagement.jsx";

function OwnerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('schedule');

    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);

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
                }
            } catch (error) {
                setMessage({type: 'error', text: 'Anlagen konnten nicht geladen werden'});
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
                {activeTab === 'courts' ? <CourtManagement facility={selectedFacility} /> : activeTab === 'settings' ? <FacilitySettings facility={selectedFacility} onFacilityUpdated ={handleOnFacilityUpdated}/> : <FacilitySchedule facility={selectedFacility}/>}
            </main>
        </div>
    );
}
export default OwnerDashboard;