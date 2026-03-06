import { expect, test } from "@playwright/test";
import { resetTestDatabase, seedExpenses } from "./helpers/db";
import { ExpensePage } from "./pages/ExpensePage";

test.describe.serial("Cat Expense Tracker", () => {
  let expensePage: ExpensePage;

  test.beforeEach(async ({ page }) => {
    // Reset the test database before each test
    await resetTestDatabase();

    expensePage = new ExpensePage(page);
    // Add cache-busting parameter to force fresh data load
    await expensePage.goto();
    await page.waitForTimeout(500); // Give server time to see database changes
    await expensePage.waitForPageLoad();
  });

  test("should create a new expense", async ({ page }) => {
    // Mock the cat fact API
    await page.route("https://catfact.ninja/fact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          fact: "Cats are amazing creatures!",
        }),
      });
    });

    // Create a new expense
    await expensePage.createExpense({
      item: "Premium Cat Food",
      category: "Food",
      amount: 29.99,
    });

    // Verify the expense appears in the table
    const rows = expensePage.getExpenseRows();
    await expect(rows).toHaveCount(1);

    const newRow = rows.first();
    const expenseData = await expensePage.getExpenseDataFromRow(newRow);

    expect(expenseData.item).toBe("Premium Cat Food");
    expect(expenseData.category).toBe("Food");
    expect(expenseData.amount).toBe(29.99);
  });

  test("should show cat facts when open create expense dialog", async ({
    page,
  }) => {
    // Mock the cat fact API
    await page.route("https://catfact.ninja/fact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          fact: "Cats are amazing creatures!",
        }),
      });
    });

    // Create a new expense
    await expensePage.createExpense({
      item: "Premium Cat Food",
      category: "Food",
      amount: 29.99,
    });

    // Verify the expense appears in the table
    await expensePage.openAddExpenseDialog();

    await expect(page.getByText("Cats are amazing creatures!")).toBeVisible();
  });

  test("should delete an expense", async () => {
    // Seed an expense
    await seedExpenses([
      { item: "Cat Toy", category: "Accessory", amount: 15.5 },
    ]);

    // Reload the page to see the seeded data
    await expensePage.goto();
    await expensePage.page.waitForTimeout(1000); // Extra wait for data to be visible
    await expensePage.waitForPageLoad();

    // Verify the expense exists
    await expect(expensePage.getExpenseRows()).toHaveCount(1);

    // Select and delete the expense
    await expensePage.selectExpenseByItem("Cat Toy");
    await expensePage.deleteSelectedExpenses();

    // Verify the expense is removed
    await expect(expensePage.getExpenseRows()).toHaveCount(0);
  });

  test("should display expenses and highlight top spending category", async () => {
    // Seed multiple expenses with different categories
    await seedExpenses([
      { item: "Cat Food 1", category: "Food", amount: 50.0 },
      { item: "Cat Food 2", category: "Food", amount: 30.0 },
      { item: "Cat Bed", category: "Furniture", amount: 40.0 },
      { item: "Cat Collar", category: "Accessory", amount: 10.0 },
      { item: "Scratching Post", category: null, amount: 25.0 },
    ]);

    // Reload the page to see the seeded data
    await expensePage.goto();
    await expensePage.page.waitForTimeout(1000); // Extra wait for data to be visible
    await expensePage.waitForPageLoad();

    // Verify all expenses are displayed
    const rows = expensePage.getExpenseRows();
    await expect(rows).toHaveCount(5);

    // Food category has highest total (80), so those rows should be highlighted
    const foodRow1 = expensePage.getExpenseRowByItem("Cat Food 1");
    const foodRow2 = expensePage.getExpenseRowByItem("Cat Food 2");
    const furnitureRow = expensePage.getExpenseRowByItem("Cat Bed");
    const accessoryRow = expensePage.getExpenseRowByItem("Cat Collar");
    const nullCategoryRow = expensePage.getExpenseRowByItem("Scratching Post");

    // Check that Food category rows are highlighted
    expect(await expensePage.hasTopCategoryHighlight(foodRow1)).toBe(true);
    expect(await expensePage.hasTopCategoryHighlight(foodRow2)).toBe(true);

    // Check that other rows are not highlighted
    expect(await expensePage.hasTopCategoryHighlight(furnitureRow)).toBe(false);
    expect(await expensePage.hasTopCategoryHighlight(accessoryRow)).toBe(false);
    expect(await expensePage.hasTopCategoryHighlight(nullCategoryRow)).toBe(
      false,
    );

    // Verify null category displays as "—"
    const nullCategoryData =
      await expensePage.getExpenseDataFromRow(nullCategoryRow);
    expect(nullCategoryData.category).toBeNull();
  });

  test("should delete multiple expenses at once", async () => {
    // Seed multiple expenses
    await seedExpenses([
      { item: "Item 1", category: "Food", amount: 10.0 },
      { item: "Item 2", category: "Food", amount: 20.0 },
      { item: "Item 3", category: "Furniture", amount: 30.0 },
    ]);

    // Reload the page
    await expensePage.goto();
    await expensePage.page.waitForTimeout(1000); // Extra wait for data to be visible
    await expensePage.waitForPageLoad();

    // Verify all expenses exist
    await expect(expensePage.getExpenseRows()).toHaveCount(3);

    // Select multiple expenses
    await expensePage.selectExpenseByItem("Item 1");
    await expensePage.selectExpenseByItem("Item 3");

    // Delete selected expenses
    await expensePage.deleteSelectedExpenses();

    // Verify only Item 2 remains
    await expect(expensePage.getExpenseRows()).toHaveCount(1);
    await expect(expensePage.getExpenseRowByItem("Item 2")).toBeVisible();
  });
});
