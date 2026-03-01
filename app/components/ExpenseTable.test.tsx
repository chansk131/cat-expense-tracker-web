import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Expense } from "../db/schema";
import { ExpenseTable } from "./ExpenseTable";

const sampleExpenses: Expense[] = [
  {
    id: 1,
    item: "Royal Canin",
    category: "Food",
    amount: 35.0,
    createdAt: new Date("2026-02-01"),
  },
  {
    id: 2,
    item: "Cat Tree Deluxe",
    category: "Furniture",
    amount: 120.0,
    createdAt: new Date("2026-02-05"),
  },
  {
    id: 3,
    item: "Collar & Bell",
    category: null,
    amount: 12.5,
    createdAt: new Date("2026-02-10"),
  },
];

const defaultProps = {
  expenses: sampleExpenses,
  topCategories: {},
  selectedIds: new Set<number>(),
  onToggleAll: vi.fn(),
  onToggleOne: vi.fn(),
};

describe("ExpenseTable", () => {
  describe("rendering", () => {
    it("renders all expense rows", () => {
      render(<ExpenseTable {...defaultProps} />);
      expect(screen.getByText("Royal Canin")).toBeInTheDocument();
      expect(screen.getByText("Cat Tree Deluxe")).toBeInTheDocument();
      expect(screen.getByText("Collar & Bell")).toBeInTheDocument();
    });

    it("renders category and formatted amount for each row", () => {
      render(<ExpenseTable {...defaultProps} />);
      expect(screen.getByText("Food")).toBeInTheDocument();
      expect(screen.getByText("Furniture")).toBeInTheDocument();
      expect(screen.getByText("$35.00")).toBeInTheDocument();
      expect(screen.getByText("$120.00")).toBeInTheDocument();
      expect(screen.getByText("$12.50")).toBeInTheDocument();
    });

    it("renders '—' for null category", () => {
      render(<ExpenseTable {...defaultProps} />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("renders only the header row when expenses is empty", () => {
      render(<ExpenseTable {...defaultProps} expenses={[]} />);
      expect(screen.getAllByRole("row")).toHaveLength(1);
    });
  });

  describe("onToggleAll", () => {
    it("calls onToggleAll(true) when header checkbox is clicked while unchecked", () => {
      const onToggleAll = vi.fn();
      render(<ExpenseTable {...defaultProps} onToggleAll={onToggleAll} />);
      const thead = screen.getAllByRole("rowgroup")[0];
      const headerCheckbox = within(thead).getByRole("checkbox");
      fireEvent.click(headerCheckbox);
      expect(onToggleAll).toHaveBeenCalledOnce();
      expect(onToggleAll).toHaveBeenCalledWith(true);
    });

    it("calls onToggleAll(false) when header checkbox is clicked while all rows are selected", () => {
      const onToggleAll = vi.fn();
      render(
        <ExpenseTable
          {...defaultProps}
          selectedIds={new Set([1, 2, 3])}
          onToggleAll={onToggleAll}
        />,
      );
      const thead = screen.getAllByRole("rowgroup")[0];
      const headerCheckbox = within(thead).getByRole("checkbox");
      fireEvent.click(headerCheckbox);
      expect(onToggleAll).toHaveBeenCalledWith(false);
    });
  });

  describe("onToggleOne", () => {
    it("calls onToggleOne(id, true) when an unchecked row checkbox is clicked", () => {
      const onToggleOne = vi.fn();
      render(<ExpenseTable {...defaultProps} onToggleOne={onToggleOne} />);
      const checkboxes = screen.getAllByRole("checkbox");
      // index 0 = header, index 1 = first row (id=1)
      fireEvent.click(checkboxes[1]);
      expect(onToggleOne).toHaveBeenCalledOnce();
      expect(onToggleOne).toHaveBeenCalledWith(1, true);
    });

    it("calls onToggleOne(id, false) when a checked row checkbox is clicked", () => {
      const onToggleOne = vi.fn();
      render(
        <ExpenseTable
          {...defaultProps}
          selectedIds={new Set([2])}
          onToggleOne={onToggleOne}
        />,
      );
      const checkboxes = screen.getAllByRole("checkbox");
      // index 2 = second row (id=2)
      fireEvent.click(checkboxes[2]);
      expect(onToggleOne).toHaveBeenCalledWith(2, false);
    });

    it("calls onToggleOne with the id matching the clicked row", () => {
      const onToggleOne = vi.fn();
      render(<ExpenseTable {...defaultProps} onToggleOne={onToggleOne} />);
      const checkboxes = screen.getAllByRole("checkbox");
      // index 3 = third row (id=3)
      fireEvent.click(checkboxes[3]);
      expect(onToggleOne).toHaveBeenCalledWith(3, true);
    });
  });

  describe("checkbox state from selectedIds", () => {
    it("all checkboxes are unchecked when selectedIds is empty", () => {
      render(<ExpenseTable {...defaultProps} selectedIds={new Set()} />);
      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      checkboxes.forEach((cb) => expect(cb.checked).toBe(false));
    });

    it("checks only the row checkboxes whose ids are in selectedIds", () => {
      render(<ExpenseTable {...defaultProps} selectedIds={new Set([1, 3])} />);
      const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(false); // header — not all selected
      expect(checkboxes[1].checked).toBe(true); // id=1 selected
      expect(checkboxes[2].checked).toBe(false); // id=2 not selected
      expect(checkboxes[3].checked).toBe(true); // id=3 selected
    });

    it("header checkbox is checked when all rows are selected", () => {
      render(
        <ExpenseTable {...defaultProps} selectedIds={new Set([1, 2, 3])} />,
      );
      const [headerCheckbox] = screen.getAllByRole(
        "checkbox",
      ) as HTMLInputElement[];
      expect(headerCheckbox.checked).toBe(true);
    });

    it("header checkbox is unchecked when only some rows are selected", () => {
      render(<ExpenseTable {...defaultProps} selectedIds={new Set([1])} />);
      const [headerCheckbox] = screen.getAllByRole(
        "checkbox",
      ) as HTMLInputElement[];
      expect(headerCheckbox.checked).toBe(false);
    });
  });
});
