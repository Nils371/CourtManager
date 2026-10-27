import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import './BookingView.css';

function PublicBookingView() {
    const urlParameter = useParams();
    const [courts, setCourts] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [allAvailabilities, setAllAvailabilities] = useState({});
    const navigate = useNavigate();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2,'0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    useEffect(() => {
        axios.get(`http://localhost:8080/api/facilities/${urlParameter.facilityId}/courts`)
            .then(response => {
                setCourts(response.data);
            });
    }, [urlParameter]);

    useEffect(() => {
        if (courts.length === 0) return;

        const fetchAllSchedules = async () => {
            try {
                const newAvailabilities = {};

                const fetchPromises = courts.map(async (court) => {
                    const response = await axios.get(`http://localhost:8080/api/courts/${court.id}/availability?startDate=${currentDate}`);
                    newAvailabilities[court.id] = response.data;
                });

                await Promise.all(fetchPromises);
                setAllAvailabilities(newAvailabilities);

            } catch (error) {
                console.error("Fehler beim Laden der Court-Zeiten:", error);
            }
        };

        fetchAllSchedules();
    }, [courts]);

    function handleSlotClick(court, slot) {
        if (slot.isAvailable) {
            const slotId = `${court.id}_${slot.start}`;

            setSelectedSlots((prev) => {
                if (prev.includes(slotId)) {
                    return prev.filter((id) => id !== slotId);
                } else {
                    return [...prev, slotId];
                }
            });
        } else {
            console.log("Setze auf Warteliste");
        }
    }

    const formatHour = (h) => String(h).padStart(2, "0");
    const formatDay = (dayString) => new Date(dayString).toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit"
    });

    const cartSummary = courts.map(court => {
        const bookedSlots = selectedSlots.filter(slotId => slotId.startsWith(`${court.id}_`));
        return {
            id: court.id,
            name: court.name,
            count: bookedSlots.length,
            totalPrice: bookedSlots.length * (court.hourlyRate || 20)
        };
    }).filter(item => item.count > 0);

    const grandTotal = cartSummary.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
        <div className="booking-container">
            <div className="layout-wrapper">
                <div className="matrix-section">
                    {courts.map(court => {
                        const timeSlots = allAvailabilities[court.id];
                        if (!timeSlots) return null;

                        const days = Object.keys(timeSlots);
                        if (days.length === 0) return null;

                        const firstDaySlots = timeSlots[days[0]];
                        const startHour = parseInt(firstDaySlots[0].start.split('T')[1].split(':')[0]);
                        const endHour = parseInt(firstDaySlots[firstDaySlots.length - 1].start.split('T')[1].split(':')[0]);

                        const hours = [];
                        for (let i = startHour; i <= endHour; i++) {
                            hours.push(i);
                        }

                        return (
                            <div key={court.id} className="court-block" style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                                    {court.name}
                                </h2>

                                <table className = "schedule-table">
                                    <thead>
                                    <tr>
                                        <th></th>
                                        {days.map(day => (
                                            <th key={day}>{formatDay(day)}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {hours.map(hour => {
                                        const currentHourStr = formatHour(hour);
                                        const nextHourStr = formatHour(hour + 1);

                                        return (
                                            <tr key={hour}>
                                                <th>{currentHourStr}:00 - {nextHourStr}:00</th>
                                                {days.map(day => {
                                                    const exactSlot = timeSlots[day].find(
                                                        slot => slot.start.split('T')[1].startsWith(`${currentHourStr}:`)
                                                    );

                                                    const isSelected = selectedSlots.includes(`${court.id}_${exactSlot?.start}`);

                                                    return (
                                                        <td key={day}>
                                                            {!exactSlot ? (
                                                                <span className="slot-leer">-</span>
                                                            ) : exactSlot.isPast ? (
                                                                // 2. Fall: Der Slot liegt in der Vergangenheit
                                                                <button className="slot-vergangen" disabled>
                                                                    Vergangen
                                                                </button>
                                                            ) : exactSlot.isBooked ? (
                                                                // 3. Fall: Der Slot ist ausgebucht
                                                                <button
                                                                    className="slot-belegt"
                                                                    // Hier kannst du später deine Wartelisten-Funktion einbauen:
                                                                    // onClick={() => handleWaitlist(exactSlot)}
                                                                >
                                                                    Warteliste
                                                                </button>
                                                            ) : (
                                                                // 4. Fall: Der Slot ist frei (isAvailable ist automatisch true)
                                                                <button
                                                                    className={`slot-frei ${isSelected ? 'slot-selected' : ''}`}
                                                                    onClick={() => handleSlotClick(court, exactSlot)}
                                                                >
                                                                    {isSelected ? 'Ausgewählt' : 'Buchen'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>

                <div className="cart-section">
                    <h3>Warenkorb</h3>

                    {cartSummary.map(item => (
                        <p key={item.id} className="cart-items">
                            {item.count}x 1h Platzbuchung {item.name}
                            <span style={{float: 'right'}}>{item.totalPrice} €</span>
                        </p>
                    ))}

                    {cartSummary.length === 0 && (
                        <p className="cart-items" style={{fontStyle: 'italic'}}>
                            Noch keine Plätze ausgewählt.
                        </p>
                    )}

                    <p className="cart-price" style={{marginTop: '16px'}}>
                        Gesamt: <strong>{grandTotal} €</strong>
                    </p>

                    <button
                        className="checkout-btn"
                        disabled={selectedSlots.length === 0}
                        onClick={ () => navigate('/checkout', {
                            state: { selectedSlots, cartSummary, grandTotal}
                        })}
                    >
                        Weiter zum Bezahlen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PublicBookingView;