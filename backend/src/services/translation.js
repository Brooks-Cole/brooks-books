// backend/src/services/translation.js
import { v2 } from '@google-cloud/translate';

const translate = new v2.Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});

export async function translateWord(word, targetLanguage) {
  try {
    const validLanguages = ['es', 'fr', 'pt', 'it', 'hi', 'zh'];
    
    if (!validLanguages.includes(targetLanguage)) {
      throw new Error(`Unsupported language code: ${targetLanguage}`);
    }

    // Special handling for Chinese to ensure simplified characters
    const options = targetLanguage === 'zh' ? { to: 'zh-CN' } : { to: targetLanguage };
    
    const [translation] = await translate.translate(word, options);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

export async function translateBatch(words, targetLanguages = ['es', 'fr', 'pt', 'it', 'hi', 'zh']) {
  try {
    const results = {};
    for (const word of words) {
      results[word] = {};
      for (const lang of targetLanguages) {
        const translation = await translateWord(word, lang);
        results[word][lang] = translation;
      }
    }
    return results;
  } catch (error) {
    console.error('Batch translation error:', error);
    throw error;
  }
}