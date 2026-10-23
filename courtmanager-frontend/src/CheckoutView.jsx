import { useLocation } from "react-router-dom";
import { useState } from "react";
import './CheckoutView.css';

function CheckoutView() {
    const location = useLocation();
    const { selectedSlots, cartSummary, grandTotal } = location.state || {
        selectedSlots: [], cartSummary: [], grandTotal: 0
    };

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
                        {['paypal', 'apple_pay', 'google_pay', 'kreditkarte'].map(method => (
                            <label
                                key={method}
                                className={`payment-label ${paymentMethod === method ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method}
                                    checked={paymentMethod === method}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                {/* Namen für die Anzeige aufhübschen */}
                                <span>
                                    {method === 'paypal' && 'PayPal'}
                                    {method === 'apple_pay' && 'Apple Pay'}
                                    {method === 'google_pay' && 'Google Pay'}
                                    {method === 'kreditkarte' && 'Kreditkarte'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* RECHTE SEITE: Bestellübersicht */}
                <div className="order-summary-section">
                    <h2>Bestellübersicht</h2>

                    <div className="order-items">
                        {detailedOrder.map(item => (
                            <div key={item.id} className="summary-item">
                                <div>
                                    <strong>{item.courtName}</strong>
                                    <div className="item-details">{item.date} | {item.time}</div>
                                </div>
                                <div className="item-price">{item.price} €</div>
                            </div>
                        ))}
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