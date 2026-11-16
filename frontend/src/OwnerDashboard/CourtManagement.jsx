import { useCourts } from "../hooks/useCourts.js";
import { useState} from "react";
import {FaTrashAlt} from "react-icons/fa";

const CourtManagement = ({ facility }) => {
    const {courts, isLoading, message, handleCreateCourt, handleDeleteCourt} = useCourts(facility?.id);
    const [showNewCourtForm, setShowNewCourtForm] = useState(false);
    const [newCourt, setNewCourt] = useState({name: '', isIndoor: false, hourlyRate: ''});

    const onSubmitNewCourt = async (e) => {
        e.preventDefault();
        const success = await handleCreateCourt(newCourt);
        if(success) {
            setNewCourt({name: '', isIndoor: false, hourlyRate: ''});
            setShowNewCourtForm(false);
        }
    };

    const onDeleteCourt = async (courtId) => {
        if (window.confirm("Bist du sicher, dass du diesen Platz löschen möchtest?")) {
            await handleDeleteCourt(courtId);
        }
    };

    if (!facility) return <div>Lade Anlage...</div>;

    return (
        <div className="tab-content">
            <div className="dashboard-header">
                <h2>Plätze der Anlage: {facility?.name}</h2>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {!showNewCourtForm && (
                    <button className="btn-primary" onClick={() => setShowNewCourtForm(true)}>
                        + Neuen Platz anlegen
                    </button>
                )}
            </div>

            {showNewCourtForm && (
                <div className="settings-section">
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Neuen Platz erstellen</h3>

                    <form onSubmit={onSubmitNewCourt} className="settings-form">
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

            {isLoading ? (
                <p>Lade Plätze...</p>
            ) : courts.length === 0 ? (
                <p>Keine Plätze für diese Anlage vorhanden.</p>
            ) : (
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
                                            onClick={() => onDeleteCourt(court.id)}
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
            )}
        </div>
    );
}
export default CourtManagement;