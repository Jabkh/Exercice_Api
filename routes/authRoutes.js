// Importez les modules nécessaires
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Créez une instance du routeur Express
const router = express.Router();

// Mockup de la base de données des utilisateurs (vous devrez remplacer cela par une vraie base de données)
const users = [];

// Route pour l'inscription (signup)
router.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // Vérifiez si l'utilisateur existe déjà
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
  }

  // Hachez le mot de passe avant de le stocker (utilisez une version asynchrone de bcrypt)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Stockez l'utilisateur dans la "base de données"
  users.push({ username, password: hashedPassword });

  res.json({ message: 'Inscription réussie' });
});

// Route pour la connexion (login)
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Vérifiez si l'utilisateur existe
  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
  }

  // Vérifiez le mot de passe en comparant avec le hachage stocké
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
  }

  // Générez le token JWT
  const token = jwt.sign({ username }, 'votre_clé_secrète', { expiresIn: '1h' });

  // Retournez le token
  res.json({ token });
});

// Route protégée nécessitant un token JWT
router.get('/api/profile', (req, res) => {
  // Obtenez le token depuis l'en-tête de la requête
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // Vérifiez le token
  jwt.verify(token, /*'clé_secrète',*/ (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // L'utilisateur est authentifié, vous pouvez renvoyer ses informations ici
    res.json({ username: decoded.username });
  });
});

// Exportez le routeur pour qu'il puisse être utilisé dans votre application Express
module.exports = router;
