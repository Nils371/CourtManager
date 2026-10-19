import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

function PublicBookingView() {
    const urlParameter = useParams();
    const [courts, setCourts] = useState([]);

    useEffect( () => {
        axios.get(`http://localhost:8080/api/facilities/${urlParameter.facilityId}/courts`)
            .then( response => {
                console.log(response.data)
            });
    }, [urlParameter]);

    console.log(urlParameter);
    return(<h1> "Hier entsteht später der Kalender" </h1>);
}

export default PublicBookingView;