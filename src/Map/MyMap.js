import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { addDays, format } from "date-fns";
import React, { useEffect, useState } from "react";
const getCountry = require("country-currency-map").getCountry;

// variables
const libraries = ["places"];
const googleMapStyles = {
  width: "60vw",
  height: "60vh",
};

const MyMap = () => {
  const [position, setPosition] = useState({ lat: 23.810331, lng: 90.412521 });
  const [weatherInfo, setWeatherInfo] = useState({});
  const [locationInfo, setLocationInfo] = useState({});
  const [icon, setIcon] = useState("01d");
  const [currency, setCurrency] = useState("BDT");
  const [currentCurrency, setCurrentCurrency] = useState({});
  const [prevCurrency, setPrevCurrency] = useState({});
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const oneDayBefore = addDays(new Date(), -1);
  const prevDate = format(oneDayBefore, "yyyy-MM-dd");

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

  useEffect(() => {
    // weather
    fetch(urlWeather)
      .then((res) => res.json())
      .then((data) => {
        setIcon(data.weather[0].icon);
        setWeatherInfo(data);
      });

    // location
    fetch(urlLocation)
      .then((res) => res.json())
      .then((data) => setLocationInfo(data));
  }, [urlWeather, urlLocation]);

  const onClickHandler = (event) => {
    setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  };

  const locationArr = locationInfo?.display_name?.split(",") || [];
  const country = locationArr[locationArr?.length - 1]?.trim();

  useEffect(() => {
    setCurrency(getCountry(country)?.currency || "BDT");
  }, [country]);

  useEffect(() => {
    fetch(
      `http://api.exchangeratesapi.io/v1/${currentDate}?access_key=${process.env.REACT_APP_EXCHANGE_RATES_API}`
    )
      .then((res) => res.json())
      .then((data) =>
        setCurrentCurrency({
          usdChf: (data.rates.CHF / data.rates.USD).toFixed(4),
          localCurrencyUsd: (data.rates.USD / data.rates[currency]).toFixed(4),
        })
      );

    fetch(
      `http://api.exchangeratesapi.io/v1/${prevDate}?access_key=${process.env.REACT_APP_EXCHANGE_RATES_API}`
    )
      .then((res) => res.json())
      .then((data) =>
        setPrevCurrency({
          usdChf: (data.rates.CHF / data.rates.USD).toFixed(4),
          localCurrencyUsd: (data.rates.USD / data.rates[currency]).toFixed(4),
        })
      );
  }, [currentDate, prevDate, currency]);

  const localToUSD = (
    ((currentCurrency?.localCurrencyUsd - prevCurrency?.localCurrencyUsd) /
      prevCurrency?.localCurrencyUsd) *
    100
  ).toFixed(2);
  const usdChfChange = (
    ((currentCurrency?.usdChf - prevCurrency?.usdChf) / prevCurrency?.usdChf) *
    100
  ).toFixed(2);

  if (loadError) return "Error loading map.";
  if (!isLoaded) return "Loading maps.";

  return (
    <>
      {" "}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="location">
          <h1 className="text-4xl mb-6">{`${
            locationArr[locationArr?.length - 3] || ""
          }, ${locationArr[locationArr?.length - 2] || ""}, ${
            locationArr[locationArr?.length - 1] || ""
          }`}</h1>
          <div className="text-2xl mb-6 flex items-center justify-center space-x-2">
            <img
              src={`http://openweathermap.org/img/wn/${icon}.png`}
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
      <div className="grid grid-cols-3">
        <div className="">
          <div className="text-2xl font-bold text-gray-700">Currency</div>
          <div className="">{currency}-USD</div>
          <div className="">USD-CHF</div>
        </div>
        <div className="">
          <div className="text-2xl font-bold text-gray-700">Price</div>
          <div className="price">{currentCurrency?.localCurrencyUsd || 0}</div>
          <div className="price">{currentCurrency?.usdChf || 0}</div>
        </div>
        <div className="div">
          <div className="text-2xl font-bold text-gray-700">%Change</div>
          <div
            className={`${localToUSD > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {localToUSD > 0 ? `+${localToUSD}` : `${localToUSD}`}%
          </div>
          <div
            className={`${
              usdChfChange > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {usdChfChange > 0 ? `+${usdChfChange}` : `${usdChfChange || 0}`}%
          </div>
        </div>
      </div>
    </>
  );
};

export default MyMap;
