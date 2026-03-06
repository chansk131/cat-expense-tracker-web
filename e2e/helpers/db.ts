import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { expenses, type Category } from "../../app/db/schema";

const TEST_DB_PATH = "./data/expenses.test.db";

/**
 * Get a connection to the test database
 */
function getTestDb() {
  const dbDir = path.resolve("data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new Database(TEST_DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  return { sqlite, db: drizzle(sqlite) };
}

/**
 * Reset the test database by deleting all expenses
 */
export async function resetTestDatabase() {
  const { sqlite, db } = getTestDb();

  // Use direct SQL for more reliable deletion
  sqlite.exec("DELETE FROM expenses");

  // Also try using Drizzle (belt and suspenders approach)
  await db.delete(expenses);

  sqlite.close();
}

/**
 * Seed the test database with fixture data
 */
export async function seedExpenses(
  data: Array<{ item: string; category?: Category | null; amount: number }>,
) {
  const { sqlite, db } = getTestDb();
  const values = data.map((expense) => ({
    item: expense.item,
    category: expense.category ?? undefined,
    amount: expense.amount,
  }));
  await db.insert(expenses).values(values);
  sqlite.close();
}

/**
 * Initialize the test database schema (run migrations)
 */
export async function initTestDatabase() {
  const { sqlite } = getTestDb();

  // Create the expenses table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      category TEXT,
      amount REAL NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  sqlite.close();
}
