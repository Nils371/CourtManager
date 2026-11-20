import { useEffect, useState } from "react";
import { useFacilityUpdate } from "../hooks/useFacilityUpdate.js";

const FacilityManagement = ({ facility, onFacilityUpdated }) => {
    const [isEditingFacility, setIsEditingFacility] = useState(false);
    const [editFacility, setEditFacility] = useState(null);

    useEffect(() => {
        if (facility) {
            setEditFacility({...facility});
        }
    }, [facility]);

    const twentyFourHours = Array.from( { length : 24 }, (_, i) => i.toString().padStart(2, '0').concat(':00'));
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const {update, isLoading, message} = useFacilityUpdate();

    const handleCancelEditFacility = () => {
        setEditFacility({...facility});
        setIsEditingFacility(false);
    };

    const handleUpdateFacility = async (e) => {
        e.preventDefault();

        const payload = {
            name: editFacility.name,
            openingTime: editFacility.openingTime,
            closingTime: editFacility.closingTime,
            hasShower: editFacility.hasShower,
            hasChangingRoom: editFacility.hasChangingRoom,
            hasToilet: editFacility.hasToilet,
            hasSnackBar: editFacility.hasSnackBar
        };

        const updateData = await update(facility.id, payload);
        if (updateData) {
            onFacilityUpdated(updateData);
            setIsEditingFacility(false);
        }
    };

    return (
    <div className="settings-wrapper">
        {!editFacility ? (
            "Lade Daten..."
        ) : !isEditingFacility ? (
            /* --- LESE-MODUS --- */
            <div className="settings-section">
                <div className="settings-info">
                    <div className="info-group full-width">
                        <label>Name der Anlage</label>
                        <p className="fw-500">{facility.name}</p>
                    </div>
                    <div className="info-group half-width">
                        <label>Öffnungszeiten</label>
                        <p>
                            {formatTime(facility.openingTime)} - {formatTime(facility.closingTime)} Uhr
                        </p>
                    </div>
                    <div className="info-group full-width">
                        <label className="mb-8">Ausstattung</label>
                        <div className="amenities-container">
                            {facility.hasShower && <span>🚿 Dusche</span>}
                            {facility.hasChangingRoom && <span>👕 Umkleide</span>}
                            {facility.hasToilet && <span>🚽 Toilette</span>}
                            {facility.hasSnackBar && <span>☕ Snackbar</span>}
                            {!facility.hasShower && !facility.hasChangingRoom && !facility.hasToilet && !facility.hasSnackBar && (
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

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdateFacility} className="settings-form">
                    <div className="form-group form-row-full">
                        <label htmlFor="facilityName">Name der Anlage:</label>
                        <input type="text" id="facilityName" className="input-field"
                               value={editFacility.name || ''} onChange={(e) => setEditFacility({...editFacility, name: e.target.value})} required />
                    </div>

                    <div className="form-row-split">
                        <div className="form-group form-col">
                            <label htmlFor="openingTime">Öffnungszeiten:</label>
                            <select
                                value = {editFacility.openingTime}
                                onChange={(e) => setEditFacility({...editFacility, openingTime: e.target.value})}
                                className="input-field"
                            >
                                {twentyFourHours.map(hour => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group form-col">
                            <label htmlFor="closingTime">Schließzeiten:</label>
                            <select
                                value = {editFacility.closingTime}
                                onChange={(e) => setEditFacility({...editFacility, closingTime: e.target.value})}
                                className="input-field"
                            >
                                {twentyFourHours.map(hour => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>
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
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Speichere...' : 'Änderungen speichern'}
                        </button>
                    </div>
                </form>
            </div>
        )}
    </div>
) }
export default FacilityManagement;