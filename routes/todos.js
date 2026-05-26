const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/todos — Récupérer toutes les tâches
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json({ success: true, count: todos.length, data: todos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/todos/:id — Récupérer une tâche par ID
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
    }
    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/todos — Créer une nouvelle tâche
router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Le titre est obligatoire' });
    }

    const todo = await Todo.create({ title, description, priority });
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/todos/:id — Modifier une tâche
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, priority } = req.body;

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
    }

    res.json({ success: true, data: todo });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// PATCH /api/todos/:id/toggle — Basculer l'état complété
router.patch('/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/todos/:id — Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
    }
    res.json({ success: true, message: 'Tâche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
