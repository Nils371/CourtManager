import {useFacilityBookings} from "../hooks/useFacilityBookings.js";
import {useState} from "react";

const FacilitySchedule = ({ facility }) => {
    const {facilityBookings, isLoading, message, handleConfirmPayment} = useFacilityBookings(facility?.id);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const totalRevenue = facilityBookings.reduce((sum, booking) => sum + (booking.isPaid ? booking.totalPrice : 0), 0);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

    const onPaymentClick = async (bookingId) => {
        setIsConfirmingPayment(true);

        const success = await handleConfirmPayment(bookingId);

        setIsConfirmingPayment(false);

        if (success) {
            setSelectedBooking(prev => ({...prev, isPaid: true}));
        } else {
            setSelectedBooking(null);
        }
    };

    if (!facility) return <div>Lade Anlage...</div>;

    return(
        <div className="tab-content">
            <div className="dashboard-header">
                <h2>Wochenplan der Anlage: {facility.name}</h2>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                {isLoading ? (
                    <p>Lade Buchungen...</p>
                ) : facilityBookings.length === 0 ? (
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
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                                        onClick={() => onPaymentClick(selectedBooking.id)}
                                        disabled={isConfirmingPayment}>
                                    {isConfirmingPayment ? 'Bestätige Zahlung...' : 'Zahlung bestätigen'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FacilitySchedule;
