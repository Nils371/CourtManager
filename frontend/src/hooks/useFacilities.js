import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export const useFacilities = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({type: '', text: ''});
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);

    useEffect (() => {
        const token = localStorage.getItem('token');
        if(!token) {
            navigate('/');
            return;
        }
        fetchFacilities()
    }, [navigate]);

    const fetchFacilities = async () => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/facilities/my', {
                headers: {Authorization: `Bearer ${token}`}
            });
            setFacilities(response.data);

            if (response.data.length > 0) {
                const firstFacility = response.data[0];
                setSelectedFacility(firstFacility);
            }
        } catch (error) {
            setMessage({type: 'error', text: 'Anlagen konnten nicht geladen werden'});
        } finally {
            setIsLoading(false);
        }
    };

    const updateFacility = async (facilityId, payload) => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/facilities/${facilityId}`, payload, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setMessage({ type: 'success', text: 'Anlage erfolgreich aktualisiert!' });
            setFacilities(prev => prev.map( facility =>
                facilityId === facility.id ? response.data : facility )
            );

            if(selectedFacility?.id === facilityId) {
                setSelectedFacility(response.data);
            }

            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Aktualisieren der Anlage"
            setMessage({type: 'error', text: errorMsg});
        } finally {
            setIsLoading(false);
        }
    }

    const deleteFacility = async (facilityId) => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:8080/api/facilities/${facilityId}`,{
                headers: {Authorization: `Bearer ${token}`}
            });
            setMessage({ type: 'success', text: 'Anlage erfolgreich gelöscht!' });

            setFacilities(prev => {
                const updated = prev.filter(facility => facility.id !== facilityId);
                if (selectedFacility?.id === facilityId) {
                    setSelectedFacility(updated.length > 0 ? updated[0] : null);
                }
                return updated;
            });

            return true;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Löschen der Anlage"
            setMessage({type: 'error', text: errorMsg});
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    const createFacility = async (facilityData) => {
        setIsLoading(true);
        setMessage({type: '' , text: ''})

        try{
            const token = localStorage.getItem('token');
            const payload = {
                name : facilityData.name,
                openingTime : facilityData.openingTime,
                closingTime : facilityData.closingTime,
                hasShower : facilityData.hasShower,
                hasChangingRoom : facilityData.hasChangingRoom,
                hasToilet : facilityData.hasToilet,
                hasSnackBar : facilityData.hasSnackBar
            };
            const response = await axios.post('http://localhost:8080/api/facilities', payload, {
                headers: {Authorization: `Bearer ${token}`}
            })

            setFacilities(prev => [...prev, response.data]);
            setMessage({ type: 'success', text: 'Neue Anlage erfolgreich angelegt!' });
            if(selectedFacility === null) {
                setSelectedFacility(response.data)
            }

            return response.data;
        } catch(error) {
            const errorMsg = error.response?.data?.message || "Fehler beim Erstellen der Anlage"
            setMessage({type: 'error', text: errorMsg});
        } finally {
            setIsLoading(false);
        }
    }

    return ( {
        isLoading,
        message,
        facilities,
        selectedFacility,
        setSelectedFacility,
        fetchFacilities,
        updateFacility,
        deleteFacility,
        createFacility
    });
}
