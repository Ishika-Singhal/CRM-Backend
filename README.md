# Mini CRM Backend

This is the **backend application** for the **Mini CRM platform**, built with **Node.js**, **Express**, and **MongoDB**. It provides RESTful APIs and business logic for managing customers, orders, and marketing campaigns. It also integrates **Google OAuth** for authentication and the **Gemini API** for AI-powered segmentation.

---

## ✨ Features

- **RESTful API**: Endpoints for customers, orders, campaigns, communication logs, and AI features.
- **Google OAuth Authentication**: Secure user login via Passport.js and OAuth 2.0.
- **Customer Management**: Full CRUD operations for customer profiles.
- **Order Management**: Full CRUD operations for customer orders.
- **Campaign Management**:
  - Create, retrieve, update, and delete campaigns.
  - Store and evaluate dynamic segmentation rules.
  - Simulate campaign message delivery and track outcomes.
- **Communication Logs**: Record delivery status and errors for each message.
- **AI-Powered Segmentation**: Convert natural language into segmentation rules using the Gemini API.
- **Persistent Sessions**: Session storage in MongoDB via `connect-mongo`.
- **Centralized Error Handling** for all API responses.

---

## 🚀 Technologies Used

- **Node.js** – JavaScript runtime.
- **Express.js** – Web framework for building APIs.
- **MongoDB** – NoSQL database for storing application data.
- **Mongoose** – ODM for MongoDB and Node.js.
- **Passport.js** – Authentication middleware (Google OAuth strategy).
- **Express-Session** – Middleware for session management.
- **Connect-Mongo** – MongoDB session store.
- **Axios** – HTTP client for external API calls (e.g., Gemini).
- **Dotenv** – Manage environment variables.
- **Joi** – Data validation library.

---

## ⚙️ Setup and Local Development

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- MongoDB (local or cloud-hosted)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <your-backend-repo-url>
   cd mini-crm/backend
Install dependencies:

npm install
# OR
yarn install
Create a .env file in the backend/ directory:

PORT=5000
MONGO_URI=mongodb://localhost:27017/minicrm
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session Secret
SESSION_SECRET=a_very_long_and_secure_random_string

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Gemini API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
Start MongoDB (if running locally):

mongod
Run the development server:

npm run dev
# OR
nodemon server.js
Server will start on http://localhost:5000.
