const express = require('express');

const User = require('./user.model');
const analyzeRequest = require('./gpt');

const router = express.Router();

router.get('/users', async (req, res, next) => {
  return res.json({
    users: await User.find({}).exec(),
  });
});

router.post('/login', analyzeRequest, async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password }).exec();

  if (!user) {
    return res.status(404).json({
      message: 'Invalid username or password',
    });
  }

  res.status(200).json({
    message: `Logged in as ${user.username}`,
  });
});

router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    
    const user = await User.create({ username, password });
    
    res.json({
        message: `Registered as ${user.username}`,
    });
});


router.post('/check-account', async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username }).exec();
  if (user) {
    res.json({
      userExists: true,
    });
  } else {
    res.json({
      userExists: false,
    });
  }
});

module.exports = router;