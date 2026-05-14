const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const parkingRoutes = require('./src/routes/parkingRoutes');
const guidanceRoutes = require('./src/routes/guidanceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const app = express();

app.use(express.json());

// CORS cho phép frontend gọi API
app.use(cors({
  origin: 'http://localhost:5173', // port frontend
  credentials: true
}));

// Session
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parking', parkingRoutes); 
app.use('/api/guidance', guidanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.listen(5000, () => console.log('Backend running on port 5000'));