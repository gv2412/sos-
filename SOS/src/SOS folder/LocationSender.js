import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocationSender() {
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const apiKey = "31d7c7a10b9f4b2ba2cb5a329c02a5c8"; // Replace with your OpenCage API key
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserName = localStorage.getItem("userName") || "";
    const savedUserPhone = localStorage.getItem("userPhoneNumber") || "";
    setUserName(savedUserName);
    setUserPhoneNumber(savedUserPhone);

    if (savedUserName) {
      requestLocationAccess();
    }
  }, []);

  const requestLocationAccess = () => {
    if (window.confirm("Allow access to your location?")) {
      getLocation();
    } else {
      alert("Location access denied. Some features may not work properly.");
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          getLocationName(latitude, longitude);
        },
        (err) => {
          alert("Error getting location: " + err.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const getLocationName = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
      );
      const result = response.data.results[0];
      setLocationName(result?.formatted || "Location name not found");
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Error fetching location name");
    }
  };

  const handleUserChange = (e) => {
    const newUserName = e.target.value;
    setUserName(newUserName);
    localStorage.setItem("userName", newUserName);

    // Prompt for location access when user changes
    requestLocationAccess();

    // Clear any previous user's contact data
    localStorage.removeItem(`contacts_${newUserName}`);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;

    if (/^\d{0,10}$/.test(newPhone)) {
      // Valid phone number (up to 10 digits)
      setUserPhoneNumber(newPhone);
      setPhoneError("");
      localStorage.setItem("userPhoneNumber", newPhone);
    } else {
      setPhoneError("Invalid phone number: Phone number must not exceed 10 digits.");
    }
  };

  const goToManageContacts = () => {
    navigate("/manage-contacts");
  };

  return (
    <div className="container">
      <h2>Welcome, {userName}</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={handleUserChange}
      />
      <input
        type="text"
        placeholder="Enter your phone number"
        value={userPhoneNumber}
        onChange={handlePhoneChange}
        maxLength={10}
      />
      {phoneError && <p className="error-message">{phoneError}</p>}
      <div className="map">
        {position ? (
          <MapContainer center={position} zoom={13} style={{ height: "300px" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>{locationName || "Your Location"}</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <p>Loading map...</p>
        )}
      </div>
      <p>Location: {locationName}</p>
      <button onClick={goToManageContacts}>Manage Contacts</button>
    </div>
  );
}

export default LocationSender;
