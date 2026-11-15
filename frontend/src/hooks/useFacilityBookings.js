import {useEffect, useState} from "react";
import axios from "axios";

export const useFacilityBookings = (facilityId) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({type: '', text: ''});
    const [facilityBookings, setFacilityBookings] = useState([]);

    useEffect(() => {
        if (facilityId) {
            setIsLoading(true);
            fetchFacilityBookings(facilityId)
                .finally(() => setIsLoading(false));
        } else {
            setFacilityBookings([]);
        }
    }, [facilityId]);

    const fetchFacilityBookings = async (facilityId) => {
        setMessage({type: '', text: ''});
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/bookings/facility/${facilityId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            const allBookings = response.data;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            const filtered = allBookings.filter(booking => {
                const bookingDate = new Date(booking.startTime);
                return booking.status !== 'CANCELLED' && bookingDate >= today && bookingDate <= nextWeek;
            });

            filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setFacilityBookings(filtered);
        } catch (error) {
            setMessage({type: 'error', text: 'Die Buchungen der ausgewählten Anlage konnten nicht geladen werden'});
        }
    }

    const handleConfirmPayment = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/bookings/${bookingId}/mark-paid`, {}, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setFacilityBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.id === bookingId ? {...booking, isPaid: true} : booking
                )
            );
            return true;
        } catch (error) {
            setMessage({type: 'error', text: 'Die Zahlung konnte nicht bestätigt werden'});
            return false;
        }
    };

    return { facilityBookings, isLoading, message, handleConfirmPayment };
}