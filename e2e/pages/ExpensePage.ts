import { type Locator, type Page } from "@playwright/test";
import type { Category } from "../../app/db/schema";

/**
 * Page Object Model for the Expense Tracker page
 */
export class ExpensePage {
  readonly page: Page;
  readonly addExpenseButton: Locator;
  readonly deleteExpenseButton: Locator;
  readonly itemInput: Locator;
  readonly categorySelect: Locator;
  readonly amountInput: Locator;
  readonly submitButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addExpenseButton = page.getByRole("link", { name: "Add Expense" });
    this.deleteExpenseButton = page.getByRole("button", {
      name: /Delete Expense/,
    });
    this.itemInput = page.getByLabel(/Item/);
    this.categorySelect = page.getByRole("combobox", { name: /Category/ });
    this.amountInput = page.getByLabel(/Amount/);
    this.submitButton = page
      .getByRole("dialog")
      .getByRole("button", { name: /Add/ });
    this.table = page.locator("table");
  }

  /**
   * Navigate to the expense page
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Open the Add Expense dialog
   */
  async openAddExpenseDialog() {
    await this.addExpenseButton.click();
    // Wait for dialog to be visible
    await this.page.getByRole("dialog").waitFor({ state: "visible" });
  }

  /**
   * Fill the expense form
   */
  async fillExpenseForm(data: {
    item: string;
    category?: Category;
    amount: number;
  }) {
    await this.itemInput.fill(data.item);

    if (data.category) {
      await this.categorySelect.click();
      await this.page.getByRole("option", { name: data.category }).click();
    }

    await this.amountInput.fill(data.amount.toString());
  }

  /**
   * Submit the expense form
   */
  async submitExpenseForm() {
    await this.submitButton.click();
    // Wait for dialog to close
    await this.page.getByRole("dialog").waitFor({ state: "hidden" });
  }

  /**
   * Create a new expense by opening dialog, filling form, and submitting
   */
  async createExpense(data: {
    item: string;
    category?: Category;
    amount: number;
  }) {
    await this.openAddExpenseDialog();
    await this.fillExpenseForm(data);
    await this.submitExpenseForm();
  }

  /**
   * Get all expense rows from the table
   */
  getExpenseRows() {
    return this.table.locator("tbody tr");
  }

  /**
   * Get a specific expense row by item name
   */
  getExpenseRowByItem(itemName: string) {
    return this.table.locator("tbody tr", {
      has: this.page.locator("td", { hasText: itemName }),
    });
  }

  /**
   * Select an expense checkbox by item name
   */
  async selectExpenseByItem(itemName: string) {
    const row = this.getExpenseRowByItem(itemName);
    await row.locator('input[type="checkbox"]').check();
  }

  /**
   * Click the delete button
   */
  async deleteSelectedExpenses() {
    await this.deleteExpenseButton.click();
    // Wait a moment for the deletion to process
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get the expense data from a table row
   */
  async getExpenseDataFromRow(row: Locator) {
    const cells = row.locator("td");
    const item = await cells.nth(1).textContent();
    const category = await cells.nth(2).textContent();
    const amountText = await cells.nth(3).textContent();
    const amount = amountText ? parseFloat(amountText.replace("$", "")) : null;

    return {
      item: item?.trim() || "",
      category: category?.trim() === "—" ? null : category?.trim() || null,
      amount: amount || 0,
    };
  }

  /**
   * Check if a row has the top category highlight (amber background)
   */
  async hasTopCategoryHighlight(row: Locator) {
    const className = await row.getAttribute("class");
    return className?.includes("bg-amber") || false;
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
