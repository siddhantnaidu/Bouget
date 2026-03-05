import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
};

type ExpenseContextValue = {
  expenses: Expense[];
  categories: string[];
  monthlyBudget: number;
  addExpense: (expense: Omit<Expense, 'id' | 'date'> & { date?: string }) => void;
  removeExpense: (id: string) => void;
  addCategory: (category: string) => void;
  setMonthlyBudget: (value: number) => void;
};

const defaultCategories = ['Food', 'Transport', 'Housing', 'Health', 'Shopping', 'Other'];

const seededExpenses: Expense[] = [
  { id: '1', title: 'Groceries', amount: 74.2, category: 'Food', date: '2026-03-01' },
  { id: '2', title: 'Uber ride', amount: 18.35, category: 'Transport', date: '2026-03-02' },
  { id: '3', title: 'Coffee beans', amount: 16.99, category: 'Food', date: '2026-03-02' },
  { id: '4', title: 'Pharmacy', amount: 23.15, category: 'Health', date: '2026-03-03' },
];

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(seededExpenses);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(1200);

  function addExpense(expense: Omit<Expense, 'id' | 'date'> & { date?: string }) {
    const normalizedCategory = expense.category.trim();
    if (!normalizedCategory) return;

    const nextExpense: Expense = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: expense.title.trim(),
      amount: expense.amount,
      category: normalizedCategory,
      date: expense.date ?? new Date().toISOString().slice(0, 10),
      notes: expense.notes?.trim(),
    };

    setExpenses((current) => [nextExpense, ...current]);
    setCategories((current) =>
      current.includes(normalizedCategory) ? current : [...current, normalizedCategory]
    );
  }

  function removeExpense(id: string) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  function addCategory(category: string) {
    const trimmed = category.trim();
    if (!trimmed) return;
    setCategories((current) => (current.includes(trimmed) ? current : [...current, trimmed]));
  }

  const value = useMemo(
    () => ({
      expenses,
      categories,
      monthlyBudget,
      addExpense,
      removeExpense,
      addCategory,
      setMonthlyBudget,
    }),
    [expenses, categories, monthlyBudget]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
