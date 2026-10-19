import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

function PublicBookingView() {
    const urlParameter = useParams();
    const [courts, setCourts] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    useEffect( () => {
        axios.get(`http://localhost:8080/api/facilities/${urlParameter.facilityId}/courts`)
            .then( response => {
                console.log(response.data)
            });
    }, [urlParameter]);

    console.log(urlParameter);
    return(
        <ul>
            {
                courts.map( court => <li key = {court.id}>  {court.name} </li>)
            }
        </ul>
    );
}

function fetchAvailability(courtId) {
    axios.get(`http://localhost:8080/api/facilities/${urlParameter.facilityId}/courts`)

}

export default PublicBookingView;