import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    const [courtId, setCourtId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [bookingMessage, setBookingMessage] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8080/api/auth/login', {
            email: email,
            password: password
        })
            .then(response => {
                const receivedToken = response.data.token;
                console.log("Gespeicherter Token:", receivedToken);
                setToken(receivedToken);
                setError(null);
            })
            .catch(err => {
                setError("Login fehlgeschlagen. Falsche E-Mail oder Passwort?");
            });
    };

    useEffect(() => {
        if (!token) return;

        axios.get('http://localhost:8080/api/bookings/my', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setBookings(response.data);
                setError(null);
            })
            .catch(err => {
                setError("Buchungen konnten nicht geladen werden.");
            });
    }, [token]);

    if (!token) {
        return (
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h2>CourtManager Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <form onSubmit={handleLogin}>
                    <div>
                        <input
                            type="text"
                            placeholder="E-Mail"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ margin: '5px' }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Passwort"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ margin: '5px' }}
                        />
                    </div>
                    <button type="submit" style={{ margin: '5px' }}>Einloggen</button>
                </form>
            </div>
        );
    }

    const handleCreateBooking = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8080/api/bookings', {
            courtId: courtId,
            startTime: startTime,
            endTime: endTime
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                setBookings([...bookings, response.data]);
                setBookingMessage("Buchung erfolgreich angelegt!");

                setCourtId('');
                setStartTime('');
                setEndTime('');
            })
            .catch(err => {
                console.error(err);
                setBookingMessage("Fehler beim Anlegen der Buchung.");
            });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>CourtManager Dashboard</h1>

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>Neuen Platz buchen</h3>
                {bookingMessage && <p>{bookingMessage}</p>}

                <form onSubmit={handleCreateBooking}>
                    <div>
                        <label>Platz-ID (Court): </label>
                        <input type="number" value={courtId} onChange={e => setCourtId(e.target.value)} required />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label>Start: </label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label>Ende: </label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                    </div>
                    <button type="submit" style={{ marginTop: '10px' }}>Buchen</button>
                </form>
            </div>

            <h2>Meine Buchungen</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {bookings.map(booking => (
                    <li key={booking.id}>
                        Platz: {booking.courtName || booking.courtId} | Start: {new Date(booking.startTime).toLocaleString()}
                    </li>
                ))}
            </ul>
            <button onClick={() => setToken(null)}>Ausloggen</button>
        </div>
    );
}

export default App;
