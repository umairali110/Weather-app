#  WeatherNow — AI-Powered Weather Application

WeatherNow is a modern full-stack weather application that combines **live weather data** with **AI-powered insights** to provide users with more than just forecasts.

Instead of only displaying temperature and weather conditions, WeatherNow allows users to ask natural language questions like:

* *Can I go hiking tomorrow?*
* *Should I carry an umbrella today?*
* *Is it safe to travel?*
* *What should I wear today?*

The application fetches real-time weather information and uses an AI model to generate contextual, human-friendly responses based on actual forecast data.

---

##  Features

*  Real-time weather for any city
*  5-day weather forecast
*  Current temperature, humidity, pressure, and wind speed
*  Rain probability and weather conditions
*  Air Quality Index (AQI)
*  AI-powered weather assistant
*  Ask weather questions in natural language
*  Context-aware AI responses grounded in live weather data
*  Responsive and modern user interface

---

##  AI Assistant

The AI assistant understands everyday questions such as:

* Can I play cricket tomorrow?
* Should I carry an umbrella today?
* Is tomorrow good for hiking?
* What should I wear today?
* Is it a good day for outdoor activities?
* Can I wash my car today?

Rather than generating generic responses, the AI analyzes live weather information including:

* Temperature
* Weather conditions
* Rain probability
* Humidity
* Wind speed
* Air Quality Index (AQI)

This ensures responses are accurate, contextual, and useful.

---

##  Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* NestJS
* TypeScript
* REST API

### APIs

* OpenWeather API
* Hugging Face Inference API

---

##  Architecture

```text
                User
                  │
                  ▼
          Next.js Frontend
                  │
                  ▼
           NestJS Backend
          ┌────────┴────────┐
          ▼                 ▼
 OpenWeather API     Hugging Face API
          │                 │
          └────────┬────────┘
                   ▼
        AI-Powered Weather Response
```

---

##  Getting Started

### Clone the repository

```bash
git clone <your-repository-url>
```

### Install dependencies

Frontend

```bash
cd weather-frontend
npm install
```

Backend

```bash
cd weather-backend
npm install
```

### Configure Environment Variables

Backend `.env`

```env
OPENWEATHER_API_KEY=your_openweather_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
PORT=5000
```

Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run the application

Backend

```bash
npm run start:dev
```

Frontend

```bash
npm run dev
```

##  Future Improvements
* Severe weather alerts
* Location-based notifications
* Multi-language support
* Weather history and analytics

---

## 📚 What I Learned

This project strengthened my understanding of:

* Full-stack application development
* Next.js and NestJS architecture
* RESTful API design
* AI integration using Hugging Face
* Prompt engineering
* Consuming third-party APIs
* Asynchronous backend workflows
* Building responsive user interfaces
* TypeScript across the full stack

---

## 👨‍💻 Author

Developed by **Umair Ali**

If you found this project helpful, feel free to ⭐ the repository and share your feedback!
