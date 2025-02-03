import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver; // Declare driver outside

export const connectNeo4j = async () => {
  try {
    driver = neo4j.driver( // Assign to the outer driver
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );
    await driver.verifyConnectivity();
    console.log('Neo4j Connected');
    return driver; // Return the driver
  } catch (error) {
    console.error('Neo4j Connection Error:', error);
    process.exit(1);
  }
};

// Only export the driver. No need to create it again here.
export default driver;