import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import './SuccessView.css';

function SuccessView() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <div style={{ fontSize: '80px' }}>✅</div>

            <h1 style={{ color: '#2e7d32' }}>Buchung erfolgreich!</h1>

            <p style={{ fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
                Vielen Dank für deine Buchung. Wir haben dir eine Bestätigung
                per E-Mail mit allen weiteren Details geschickt.
            </p>

            <button
                className = "dashboard-btn"
                onClick={() => navigate("/dashboard")}
            >
                Zu deiner Buchungsübersicht
            </button>
        </div>
    );
}
export default SuccessView;