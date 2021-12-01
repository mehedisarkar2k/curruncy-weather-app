import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import React, { useState } from "react";

// variables
const libraries = ["places"];
const googleMapStyles = {
  width: "50vw",
  height: "50vh",
};

const MyMap = () => {
  const [position, setPosition] = useState({ lat: 23.810331, lng: 90.412521 });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const center = {
    lat: position.lat,
    lng: position.lng,
  };

  const onClickHandler = (event) => {
    setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    console.log(position);
  };

  if (loadError) return "Error loading map.";
  if (!isLoaded) return "Loading maps.";

  return (
    <div>
      <GoogleMap
        mapContainerStyle={googleMapStyles}
        zoom={10}
        center={center}
        onClick={(event) => onClickHandler(event)}
      >
        <Marker position={position} />
      </GoogleMap>
    </div>
  );
};

export default MyMap;
