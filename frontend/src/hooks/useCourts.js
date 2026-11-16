import {useEffect, useState} from "react";
import axios from "axios";

export const useCourts = (facilityId) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({type: '', text: ''});
    const [courts, setCourts] = useState([]);

    useEffect (() => {
        if (facilityId) {
            setIsLoading(true);
            fetchCourts(facilityId)
                .finally(() => setIsLoading(false));
        } else {
            setCourts([]);
        }
    }, [facilityId]);

    const fetchCourts = async (facilityId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/facilities/${facilityId}/courts`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCourts(response.data);
        } catch (error) {
            setMessage({type: 'error', text: 'Courts der ausgewählten Anlage konnten nicht geladen werden'});
        }
    }

    const handleCreateCourt = async (courtData) => {
        setMessage({type: '' , text: ''})

        try{
            const token = localStorage.getItem('token');
            const payload = {
                facilityId: facilityId,
                name: courtData.name,
                isIndoor: courtData.isIndoor,
                hourlyRate: parseFloat(String(courtData.hourlyRate).replace(',', '.'))
            };
            const response = await axios.post('http://localhost:8080/api/courts', payload, {
                headers: {Authorization: `Bearer ${token}`}
            })

            setCourts(prev => [...prev, response.data]);
            setMessage({ type: 'success', text: 'Neuer Platz erfolgreich angelegt!' });
        } catch(error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Erstellen des Platzes"
            setMessage({type: 'error', text: errorMsg});
        }
    }


    const handleDeleteCourt = async (courtId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/courts/${courtId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setCourts(prevCourts => prevCourts.filter(court => court.id !== courtId));
            setMessage({ type: 'success', text: 'Platz erfolgreich gelöscht!' });

            return true;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Löschen des Platzes"
            setMessage({type: 'error', text: errorMsg});

            return false;
        }
    };

    return { courts, isLoading, message, handleCreateCourt, handleDeleteCourt };
}


