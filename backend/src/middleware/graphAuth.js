// backend/src/middleware/graphAuth.js
import driver from '../config/neo4j.js';

export const verifyGraphConnection = async (req, res, next) => {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    next();
  } catch (error) {
    res.status(503).json({ error: 'Graph database unavailable' });
  } finally {
    await session.close();
  }
};