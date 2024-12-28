const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// OpenWeatherMap API Key
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY not found in environment variables.");
  process.exit(1); // Exit if API key is not provided
}

// Routes
app.get("/", (req, res) => {
  res.render("index", { weather: null, error: null });
});

app.get("/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.render("index", {
      weather: null,
      error: "Please enter a city name.",
    });
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Log the API response for debugging
    console.log("API Response:", data);

    // Determine the icon based on the weather condition
let icon = "";
const condition = data.weather[0].main.trim().toLowerCase(); // Normalize condition
const description = data.weather[0].description; // Detailed weather description

if (condition === "clouds") {
    icon = "/images/clouds.png";
} else if (condition === "clear") {
    icon = "/images/clear.png";
} else if (condition === "rain") {
    icon = "/images/rain.png";
} else if (condition === "drizzle") {
    icon = "/images/drizzle.png";
} else if (condition === "mist") {
    icon = "/images/mist.png";
} else if (condition === "haze") {
    icon = "/images/clear.png"; // Reuse clear for haze
} else if (condition === "snow") {
    icon = "/images/snow.png"; // Handle snow condition
} else if (condition === "thunderstorm") {
    icon = "/images/thunderstorm.png"; // Handle thunderstorms
} else {
    icon = "/images/default.png"; // Default fallback image if condition doesn't match
}

    // Create a weather object to pass to the EJS template
    const weather = {
      city: data.name,
      temp: Math.round(data.main.temp), // Rounded temperature
      feels_like: Math.round(data.main.feels_like), // Feels like temperature
      humidity: data.main.humidity, // Humidity percentage
      pressure: data.main.pressure, // Atmospheric pressure
      visibility: data.visibility, // Visibility in meters
      wind: `${data.wind.speed} km/h`, // Wind speed with units
      icon: icon, // Weather icon based on condition
      description: description, // Detailed weather description
    };

    res.render("index", { weather, error: null });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    res.render("index", {
      weather: null,
      error: "Invalid city name or something went wrong.",
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
