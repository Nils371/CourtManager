import axios from "axios";
import {useState} from "react";

export const useFacilityUpdate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const update = async (facilityId, payload) => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/facilities/${facilityId}`, payload, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setMessage({ type: 'success', text: 'Anlage erfolgreich aktualisiert!' });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Aktualisieren der Anlage"
            setMessage({type: 'error', text: errorMsg});
        } finally {
            setIsLoading(false);
        }
    }

    return { update, isLoading, message };
}