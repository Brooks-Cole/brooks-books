// frontend/src/services/translationService.js
 import config from '../config/config.js';

export const translateWord = async (word, targetLanguage) => {
  try {
    console.log(`Translating "${word}" to ${targetLanguage}...`);
    const response = await fetch(`${config.apiUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        word,
        targetLanguage
      })
    });

    // Add this to see the actual response content
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      // Don't try to parse as JSON immediately
      throw new Error(`Translation failed with status: ${response.status}. Response: ${responseText}`);
    }

    // Only try to parse as JSON if we know it's JSON
    try {
      const data = JSON.parse(responseText);
      return data.translation;
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};