// backend/src/routes/translation.js
import express from 'express';
import { v2 } from '@google-cloud/translate'; // Change this line
import auth from '../middleware/auth.js';

const router = express.Router();

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const translate = new v2.Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials
});

// const translate = new v2.Translate({ // And update this line
//   projectId: process.env.GOOGLE_PROJECT_ID,
//   credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
// });

router.post('/', auth, async (req, res) => {
  console.log('Translation request received:', req.body);
  try {
    const { word, targetLanguage } = req.body;
    const [translation] = await translate.translate(word, targetLanguage);
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;