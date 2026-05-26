const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const todoRoutes = require('./routes/todos');

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || '*'
    : 'http://localhost:3000',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route de santé (health check)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 API Todo List opérationnelle', env: process.env.NODE_ENV });
});

// Routes API
app.use('/api/todos', todoRoutes);

// Servir le frontend React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  // Toutes les routes non-API renvoient le frontend React
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Gestion des routes inconnues (en développement)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré en mode ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Écoute sur http://localhost:${PORT}`);
  console.log(`🔗 API disponible sur http://localhost:${PORT}/api/todos\n`);
});
