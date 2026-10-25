import { useLocation } from "react-router-dom";
import { useState } from "react";
import './CheckoutView.css';
import { FaPaypal, FaApplePay, FaGooglePay, FaCreditCard } from "react-icons/fa";

function CheckoutView() {
    const location = useLocation();
    const { selectedSlots, cartSummary, grandTotal } = location.state || {
        selectedSlots: [], cartSummary: [], grandTotal: 0
    };

    const paymentOptions = [
        { id: 'paypal', name: 'PayPal', icon: <FaPaypal size={24} color="#003087" /> },
        { id: 'apple_pay', name: 'Apple Pay', icon: <FaApplePay size={24} color="#1c1c1e" /> },
        { id: 'google_pay', name: 'Google Pay', icon: <FaGooglePay size={24} color="#5f6368" /> },
        { id: 'kreditkarte', name: 'Kreditkarte', icon: <FaCreditCard size={22} color="#8e8e93" /> }
    ];

    // State für die ausgewählte Bezahlmethode
    const [paymentMethod, setPaymentMethod] = useState("paypal");



    // 1. Die rohen IDs in detaillierte Buchungsinformationen umwandeln
    const detailedOrder = selectedSlots.map(slotId => {
        // String am Unterstrich teilen: ["1", "2026-10-22T08:00:00"]
        const [courtIdStr, startString] = slotId.split('_');
        const courtId = parseInt(courtIdStr);

        // Den Namen des Courts aus der cartSummary fischen
        const courtData = cartSummary.find(c => c.id === courtId);
        const courtName = courtData ? courtData.name : `Court ${courtId}`;

        // Datum und Uhrzeiten berechnen
        const startDate = new Date(startString);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 Stunde addieren

        const formattedDate = startDate.toLocaleDateString("de-DE", {
            weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const startTime = startDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });
        const endTime = endDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });

        return {
            id: slotId,
            courtId,
            courtName,
            date: formattedDate,
            time: `${startTime} - ${endTime}`,
            price: courtData ? courtData.totalPrice / courtData.count : 0 // Einzelpreis berechnen
        };
    });

    return (
        <div className="checkout-container">
            <div className="checkout-layout">

                {/* LINKE SEITE: Bezahlmethoden */}
                <div className="payment-section">
                    <h2>Zahlungsmethode wählen</h2>

                    <div className="payment-options">
                        {/* 3. Die Schleife greift jetzt auf das Objekt zu */}
                        {paymentOptions.map(method => (
                            <label
                                key={method.id}
                                className={`payment-label ${paymentMethod === method.id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method.id}
                                    checked={paymentMethod === method.id}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />

                                {/* Ein kleiner Container, der Icon und Text bündelt */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {method.icon}
                                    <span style={{ fontWeight: '500' }}>{method.name}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* RECHTE SEITE: Bestellübersicht */}
                <div className="order-summary-section">
                    <h2>Bestellübersicht</h2>

                    <div className="order-items">
                        {cartSummary.map(court => {
                            // Finde alle gebuchten Zeiten, die zu exakt diesem Court gehören
                            const courtSlots = detailedOrder.filter(item => item.courtId === court.id);

                            return (
                                <div key={court.id} className="court-group" style={{ marginBottom: '24px' }}>
                                    {/* 1. Der Name des Courts als saubere Gruppen-Überschrift */}
                                    <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '12px' }}>
                                        {court.name}
                                    </strong>

                                    {/* 2. Die Liste der Zeiten nur für diesen spezifischen Court */}
                                    {courtSlots.map(item => (
                                        <div key={item.id} className="summary-item" style={{ marginBottom: '12px', paddingBottom: '12px' }}>
                                            <div className="item-details">{item.date} | {item.time}</div>
                                            <div className="item-price">{item.price} €</div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    <div className="total-row">
                        <span>Gesamtsumme</span>
                        <strong>{grandTotal} €</strong>
                    </div>

                    <button className="buy-btn">
                        Kostenpflichtig buchen
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CheckoutView;