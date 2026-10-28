import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PublicBookingView from "./PublicBookingView.jsx";
import CheckoutView from './CheckoutView';
import axios from "axios";
import SuccessView from "./SuccessView.jsx";
import CustomerDashboard from "./CustomerDashboard.jsx";

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8080/api/auth/login', {
            email: email,
            password: password
        })
            .then(response => {
                const receivedToken = response.data.token;
                console.log("Gespeicherter Token:", receivedToken);

                localStorage.setItem('token', receivedToken);

                setToken(receivedToken);
                setError(null);
                navigate("/dashboard");
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

    return (
        <Routes>
            <Route path="/" element={
                <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
                    <h2>CourtManager Login</h2>
                    {error && <p style={{color: 'red'}}>{error}</p>}

                    <form onSubmit={handleLogin}>
                        <div>
                            <input
                                type="text"
                                placeholder="E-Mail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{margin: '5px'}}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Passwort"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{margin: '5px'}}
                            />
                        </div>
                        <button type="submit" style={{margin: '5px'}}>Einloggen</button>
                    </form>
                </div>
            }/>
            <Route path="/facility/:facilityId" element={<PublicBookingView/>}/>

            <Route path="/checkout" element={<CheckoutView/>}/>

            <Route path="/success" element={<SuccessView/>}/>

            <Route path="/dashboard" element={<CustomerDashboard/>}/>

        </Routes>
    );
}
export default App;