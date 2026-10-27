import { useLocation, useNavigate } from "react-router-dom";
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


    const [paymentMethod, setPaymentMethod] = useState("paypal");

    const [checkoutMode, setCheckoutMode] = useState("guest");
    const [contactInfo, setContactInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: ""
    })

    const[isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");

    const handleCheckout = async () => {
        setErrorMessage("");
        // (Deine bisherige Validierung, z. B. ob Felder leer sind, bleibt hier)
        setIsSubmitting(true);

        try {
            let jwtToken = localStorage.getItem("token"); // Holt bestehenden Token, falls Nutzer schon eingeloggt ist

            // STUFE 1: Authentifizierung (nur bei Login oder Registrierung)
            if (checkoutMode === 'login' || checkoutMode === 'register') {
                const authEndpoint = checkoutMode === 'login'
                    ? "http://localhost:8080/api/auth/login"
                    : "http://localhost:8080/api/auth/register";

                // Den Payload je nach Modus an deine bestehenden Auth-Klassen anpassen
                const authPayload = checkoutMode === 'login'
                    ? { email: contactInfo.email, password: contactInfo.password }
                    : {
                        firstName: contactInfo.firstName,
                        lastName: contactInfo.lastName,
                        email: contactInfo.email,
                        phone: contactInfo.phone,
                        password: contactInfo.password
                    };

                const authResponse = await fetch(authEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(authPayload)
                });

                if (!authResponse.ok) throw new Error("Fehler bei der Anmeldung/Registrierung. Bitte Daten prüfen.");

                const authData = await authResponse.json();
                jwtToken = authData.token; // Speichert den vom Backend generierten Token
                localStorage.setItem("token", jwtToken);
            }

            const bookingEndpoint = checkoutMode === 'guest'
                ? "http://localhost:8080/api/bookings/guest-checkout"
                : "http://localhost:8080/api/bookings/checkout";

            const bookingPayload = {
                checkoutMode: checkoutMode,
                paymentMethod: paymentMethod,
                bookedSlots: selectedSlots,
                contactInfo: checkoutMode === 'guest' ? contactInfo : null // Nur Gäste müssen Kontaktinfos mitsenden
            };

            const headers = { "Content-Type": "application/json" };

            // Füge den Token hinzu, wenn wir nicht im Gast-Modus sind
            if (jwtToken && checkoutMode !== 'guest') {
                headers["Authorization"] = `Bearer ${jwtToken}`;
            }
            console.log("REACT PAKET:", JSON.stringify(bookingPayload));

            const response = await fetch(bookingEndpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(bookingPayload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Fehler bei der Buchung.");
            }

            navigate("/success");

        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const groupedSlots = selectedSlots.reduce((acc, slot) => {
        const [courtId, dateTime] = slot.split('_');
        if (!acc[courtId]) acc[courtId] = [];
        acc[courtId].push(dateTime);
        return acc;
    }, {});

    Object.keys(groupedSlots).forEach(courtId => {
        groupedSlots[courtId].sort((a, b) => new Date(a) - new Date(b));
    });

    return (
        <div className="checkout-container">
            <div className="checkout-layout">
                {/* LINKE SEITE: Formulare & Bezahlung */}
                <div className="left-column" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <div className="contact-section">
                        <h2>Kontaktinformationen</h2>

                        <div className="checkout-mode-toggle" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <label className={`mode-label ${checkoutMode === 'guest' ? 'active' : ''}`}>
                                <input type="radio" name="mode" value="guest" checked={checkoutMode === 'guest'} onChange={(e) => setCheckoutMode(e.target.value)} />
                                Als Gast
                            </label>
                            <label className={`mode-label ${checkoutMode === 'login' ? 'active' : ''}`}>
                                <input type="radio" name="mode" value="login" checked={checkoutMode === 'login'} onChange={(e) => setCheckoutMode(e.target.value)} />
                                Einloggen
                            </label>
                            <label className={`mode-label ${checkoutMode === 'register' ? 'active' : ''}`}>
                                <input type="radio" name="mode" value="register" checked={checkoutMode === 'register'} onChange={(e) => setCheckoutMode(e.target.value)} />
                                Konto erstellen
                            </label>
                        </div>

                        <div className="form-grid">
                            {checkoutMode !== 'login' && (
                                <>
                                    <input type="text" name="firstName" placeholder="Vorname" value={contactInfo.firstName} onChange={handleInputChange} className="input-field" required />
                                    <input type="text" name="lastName" placeholder="Nachname" value={contactInfo.lastName} onChange={handleInputChange} className="input-field" required />
                                </>
                            )}

                            <input type="email" name="email" placeholder="E-Mail Adresse" value={contactInfo.email} onChange={handleInputChange} className="input-field full-width" required />

                            {checkoutMode !== 'login' && (
                                <input type="tel" name="phone" placeholder="Telefonnummer (optional)" value={contactInfo.phone} onChange={handleInputChange} className="input-field full-width" />
                            )}

                            {(checkoutMode === 'register' || checkoutMode === 'login') && (
                                <input type="password" name="password" placeholder="Passwort" value={contactInfo.password} onChange={handleInputChange} className="input-field full-width" required />
                            )}
                        </div>
                    </div>

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
                </div>

                {/* RECHTE SEITE: Bestellübersicht */}
                <div className="order-summary-section">
                    <h2>Bestellübersicht</h2>

                    <div className="order-items">
                        {cartSummary.map(court => {
                            const courtSlots = detailedOrder
                                .filter(item => item.courtId === court.id)
                                .sort((a, b) => {
                                    const timeA = a.id.split('_')[1];
                                    const timeB = b.id.split('_')[1];
                                    return new Date(timeA) - new Date(timeB);
                                });

                            return (
                                <div key={court.id} className="court-group" style={{ marginBottom: '24px' }}>
                                    <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '12px' }}>
                                        {court.name}
                                    </strong>

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

                    <button
                        className="buy-btn"
                        onClick={handleCheckout}
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        Kostenpflichtig buchen
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CheckoutView;