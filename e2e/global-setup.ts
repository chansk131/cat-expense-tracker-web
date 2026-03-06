import { initTestDatabase } from "./helpers/db";

/**
 * Global setup runs once before all tests
 * Use this to initialize the test database schema
 */
export default async function globalSetup() {
  console.log("Initializing test database...");
  await initTestDatabase();
  console.log("Test database initialized successfully");
}
