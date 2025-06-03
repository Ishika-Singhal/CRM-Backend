
const express = require('express');
const cors = require('cors');
const session = require('express-session'); 
const passport = require('passport');
const path = require('path');

require('./config/db');
require('./config/passport'); 

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true
}))
app.use(session({
  secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_session', 
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    sameSite: 'lax' 
  }
}));



app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));


const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const communicationLogRoutes = require('./routes/communicationLogRoutes');
const aiRoutes = require('./routes/aiRoutes');


app.use('/auth', authRoutes); // Authentication routes
app.use('/api/customers', customerRoutes); // Customer data ingestion routes
app.use('/api/orders', orderRoutes); // Order data ingestion routes
app.use('/api/campaigns', campaignRoutes); // Campaign management routes
app.use('/api/communication-logs', communicationLogRoutes); // Communication log routes
app.use('/api/ai', aiRoutes); // AI-powered features routes


app.get('/', (req, res) => {
  res.send('Welcome to the Mini CRM Backend API!');
});

app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong!',
    success: false,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
