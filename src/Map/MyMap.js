import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";

// variables
const libraries = ["places"];
const googleMapStyles = {
  width: "50vw",
  height: "50vh",
};

const MyMap = () => {
  const [position, setPosition] = useState({ lat: 23.810331, lng: 90.412521 });
  const [weatherInfo, setWeatherInfo] = useState({});
  const [locationInfo, setLocationInfo] = useState({});

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const center = {
    lat: position.lat,
    lng: position.lng,
  };

  const urlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${position.lat}&lon=${position.lng}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`;

  const urlLocation = `https://us1.locationiq.com/v1/reverse.php?key=${process.env.REACT_APP_LOCATION}&lat=${position.lat}&lon=${position.lng}&format=json`;
  console.log(urlLocation);

  useEffect(() => {
    // weather
    fetch(urlWeather)
      .then((res) => res.json())
      .then((data) => setWeatherInfo(data));

    // location
    fetch(urlLocation)
      .then((res) => res.json())
      .then((data) => setLocationInfo(data));
  }, [urlWeather, urlLocation]);

  const onClickHandler = (event) => {
    setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  };

  const locationArr = locationInfo?.display_name?.split(",") || {};

  if (loadError) return "Error loading map.";
  if (!isLoaded) return "Loading maps.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="location">
        <h1 className="text-4xl mb-6">{`${
          locationArr[locationArr?.length - 3] || ""
        }, ${locationArr[locationArr?.length - 2] || ""}, ${
          locationArr[locationArr?.length - 1] || ""
        }`}</h1>
        <div className="text-2xl mb-6 flex items-center justify-center space-x-2">
          <img
            src={`http://openweathermap.org/img/wn/${weatherInfo?.weather[0].icon}.png`}
            alt="icon"
          />
          {weatherInfo?.main?.temp}
          <sup>o</sup>C
        </div>
      </div>

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
