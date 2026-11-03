import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

function OwnerDashboard() {
    const navigate = useNavigate();

    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState();
    const [courts, setCourts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchFacilitiesAndCourts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/facilities/my', {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setFacilities(response.data);

                if (response.data.length > 0) {
                    const firsFacility = response.data[0];
                    setSelectedFacility(firsFacility);

                    fetchCourts(firsFacility.id);
                }
            } catch (error) {
                setErrorMessage("Anlagen konnten nicht geladen werden");
            }
        };

        fetchFacilitiesAndCourts();

    }, [navigate]);

    const fetchCourts = async (facilityId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/courts/${selectedFacility.id}/my`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCourts(response.data);
        } catch (error) {
            setErrorMessage("Courts der ausgewählten Anlage konnten nicht geladen werden");
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Betreiber-Bereich</h2>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <h3>Meine Anlagen:</h3>
            <ul>
                {facilities.map(facility => (
                    <li key={facility.id}>
                        {facility.name} (Öffnet: {facility.openingTime})
                    </li>
                ))}
            </ul>

            <h3>Plätze der ausgewählten Anlage:</h3>
            <ul>
                {courts.map(court => (
                    <li key={court.id}>
                        {court.name} - {court.hourlyRate} €/h
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default OwnerDashboard;