import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Transaction, Category, User, CardDetails, CreditEntry, CreditHistoryItem, PaymentMethod, CreditStatus, CreditReceivedEntry, CreditReceivedHistoryItem } from '../types';
import { dummyUser, dummyCategories, dummyTransactions, dummyCards, dummyCreditEntries, dummyCreditReceivedEntries } from '../data';

type DataContextType = {
  user: User;
  transactions: Transaction[];
  categories: Category[];
  cards: CardDetails[];
  creditEntries: CreditEntry[];
  creditReceivedEntries: CreditReceivedEntry[];
  balances: { [key: string]: number };
  addTransaction: (newTransaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (updated: Transaction) => void;
  addCategory: (newCategory: Omit<Category, 'id'>) => boolean;
  deleteCategory: (id: string) => void;
  updateCategory: (updated: Category) => void;
  addCard: (newCard: Omit<CardDetails, 'id'>) => void;
  deleteCard: (id: string) => boolean; // returns success status
  updateCard: (updated: CardDetails) => void;
  addCreditEntry: (newEntry: Omit<CreditEntry, 'id' | 'givenDate' | 'returnedAmount' | 'status' | 'history'>) => void;
  addCreditReturn: (creditId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => void;
  deleteCreditEntry: (id: string) => void;
  addCreditReceivedEntry: (newEntry: Omit<CreditReceivedEntry, 'id' | 'receivedDate' | 'returnedAmount' | 'status' | 'history'>) => void;
  addCreditReceivedReturn: (entryId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => void;
  deleteCreditReceivedEntry: (id: string) => void;
  deleteCreditReceivedReturnHistory: (entryId: string, historyId: string) => void;
  resetToDefaults: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>(dummyUser);

  // Load initial state from localStorage or use dummy data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : dummyTransactions;
    } catch {
      return dummyTransactions;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('categories');
      return saved ? JSON.parse(saved) : dummyCategories;
    } catch {
      return dummyCategories;
    }
  });

  const [cards, setCards] = useState<CardDetails[]>(() => {
    try {
        const saved = localStorage.getItem('cards');
        return saved ? JSON.parse(saved) : dummyCards;
    } catch {
        return dummyCards;
    }
  });

  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>(() => {
    try {
      const saved = localStorage.getItem('creditEntries');
      return saved ? JSON.parse(saved) : dummyCreditEntries;
    } catch {
      return dummyCreditEntries;
    }
  });
  
  const [creditReceivedEntries, setCreditReceivedEntries] = useState<CreditReceivedEntry[]>(() => {
    try {
      const saved = localStorage.getItem('creditReceivedEntries');
      return saved ? JSON.parse(saved) : dummyCreditReceivedEntries;
    } catch {
      return dummyCreditReceivedEntries;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);
  
  useEffect(() => {
    localStorage.setItem('creditEntries', JSON.stringify(creditEntries));
  }, [creditEntries]);

  useEffect(() => {
    localStorage.setItem('creditReceivedEntries', JSON.stringify(creditReceivedEntries));
  }, [creditReceivedEntries]);

  const balances = useMemo(() => {
    const balanceMap: { [key: string]: number } = { cash: 0 };
    cards.forEach(card => { balanceMap[card.id] = 0; });

    transactions.forEach(t => {
        if (t.type === 'income') {
            if (t.cardId && balanceMap[t.cardId] !== undefined) {
                balanceMap[t.cardId] += t.amount;
            } else {
                balanceMap.cash += t.amount;
            }
        } else { // expense
            if (t.cardId && balanceMap[t.cardId] !== undefined) {
                balanceMap[t.cardId] -= t.amount;
            } else if (t.paymentMethod === 'cash') {
                balanceMap.cash -= t.amount;
            }
            // 'credit' expenses are handled by the transaction created in addCreditEntry
        }
    });
    return balanceMap;
  }, [transactions, cards]);


  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9), // simple unique id
    };
    setTransactions(prev => [transactionWithId, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const addCategory = (newCategory: Omit<Category, 'id'>) => {
    const exists = categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase() && c.type === newCategory.type);
    if (exists) return false;
    const categoryWithId: Category = { ...newCategory, id: new Date().getTime().toString() };
    setCategories(prev => [...prev, categoryWithId]);
    return true;
  };
  
  const deleteCategory = (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) return;

    setCategories(prev => prev.filter(c => c.id !== id));
    setTransactions(prev => prev.filter(t => t.category !== categoryToDelete.name));
  };
  
  const updateCategory = (updated: Category) => {
      const oldCategory = categories.find(c => c.id === updated.id);
      if (!oldCategory || oldCategory.name === updated.name) {
          setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
          return;
      }
      // If name changed, update transactions as well
      setTransactions(prev => prev.map(t => t.category === oldCategory.name ? { ...t, category: updated.name } : t));
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const addCard = (newCard: Omit<CardDetails, 'id'>) => {
      const cardWithId: CardDetails = { ...newCard, id: `card-${new Date().getTime()}`};
      setCards(prev => [...prev, cardWithId]);
  };
  
  const deleteCard = (id: string) => {
      const isInUse = transactions.some(t => t.cardId === id) || creditEntries.some(c => c.initialCardId === id);
      if (isInUse) return false;
      setCards(prev => prev.filter(c => c.id !== id));
      return true;
  };
  
  const updateCard = (updated: CardDetails) => {
      setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
  };
  
  // Credit Lent Functions
  const addCreditEntry = (newEntry: Omit<CreditEntry, 'id' | 'givenDate' | 'returnedAmount' | 'status' | 'history'>) => {
      const now = new Date().toISOString();
      const historyItem: CreditHistoryItem = {
          id: `hist-${Date.now()}`,
          date: now,
          amount: newEntry.amount,
          type: 'given',
          paymentMethod: newEntry.initialPaymentMethod,
          cardId: newEntry.initialCardId,
          note: newEntry.initialNote
      };
      const entryWithId: CreditEntry = {
          ...newEntry,
          id: `credit-${Date.now()}`,
          givenDate: now,
          returnedAmount: 0,
          status: 'pending',
          history: [historyItem]
      };
      // Auto-create an expense transaction
      addTransaction({
          type: 'expense',
          category: 'Credit',
          amount: newEntry.amount,
          date: now,
          note: `Credit given to ${newEntry.personName}`,
          paymentMethod: newEntry.initialPaymentMethod,
          cardId: newEntry.initialCardId,
          creditId: entryWithId.id,
          creditHistoryId: historyItem.id
      });
      setCreditEntries(prev => [entryWithId, ...prev]);
  };

  const addCreditReturn = (creditId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => {
      const now = new Date().toISOString();
      setCreditEntries(prev => prev.map(e => {
          if (e.id === creditId) {
              const newReturnedAmount = e.returnedAmount + returnAmount;
              const newStatus: CreditStatus = newReturnedAmount >= e.amount ? 'completed' : 'partially-paid';
              const newHistoryItem: CreditHistoryItem = {
                  id: `hist-${Date.now()}`,
                  date: now,
                  amount: returnAmount,
                  type: 'returned',
                  paymentMethod,
                  cardId,
                  note
              };
              // Auto-create an income transaction
              addTransaction({
                  type: 'income',
                  category: 'Credit Return',
                  amount: returnAmount,
                  date: now,
                  note: `Credit return from ${e.personName}`,
                  paymentMethod: paymentMethod, // Storing for consistency, though it's income
                  cardId: cardId,
                  creditId: e.id,
                  creditHistoryId: newHistoryItem.id
              });
              return { ...e, returnedAmount: newReturnedAmount, status: newStatus, history: [newHistoryItem, ...e.history] };
          }
          return e;
      }));
  };
  
  const deleteCreditEntry = (id: string) => {
      setCreditEntries(prev => prev.filter(e => e.id !== id));
      // Also delete associated transactions
      setTransactions(prev => prev.filter(t => t.creditId !== id));
  };
  
  // Credit Received Functions
   const addCreditReceivedEntry = (newEntry: Omit<CreditReceivedEntry, 'id' | 'receivedDate' | 'returnedAmount' | 'status' | 'history'>) => {
      const now = new Date().toISOString();
      const entryWithId: CreditReceivedEntry = {
          ...newEntry,
          id: `cr-${Date.now()}`,
          receivedDate: now,
          returnedAmount: 0,
          status: 'pending',
          history: []
      };
      // Create an income transaction, crediting a card if specified.
      addTransaction({
          type: 'income',
          category: 'Credit Received',
          amount: newEntry.amount,
          date: now,
          note: `Credit received from ${newEntry.personName}`,
          cardId: newEntry.initialCardId,
          creditReceivedId: entryWithId.id
      });
      setCreditReceivedEntries(prev => [entryWithId, ...prev]);
  };

  const addCreditReceivedReturn = (entryId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => {
      const now = new Date().toISOString();
      setCreditReceivedEntries(prev => prev.map(e => {
          if (e.id === entryId) {
              const newReturnedAmount = e.returnedAmount + returnAmount;
              const newStatus: CreditStatus = newReturnedAmount >= e.amount ? 'completed' : 'partially-paid';
              const newHistoryItem: CreditReceivedHistoryItem = {
                  id: `cr-hist-${Date.now()}`,
                  date: now,
                  amount: returnAmount,
                  paymentMethod,
                  cardId,
                  note
              };
              // Auto-create an expense transaction for the return payment
              addTransaction({
                  type: 'expense',
                  category: 'Credit Return Paid',
                  amount: returnAmount,
                  date: now,
                  note: `Repayment to ${e.personName}`,
                  paymentMethod,
                  cardId,
                  creditReceivedId: e.id,
                  creditReceivedHistoryId: newHistoryItem.id
              });
              return { ...e, returnedAmount: newReturnedAmount, status: newStatus, history: [newHistoryItem, ...e.history] };
          }
          return e;
      }));
  };
  
  const deleteCreditReceivedEntry = (id: string) => {
      setCreditReceivedEntries(prev => prev.filter(e => e.id !== id));
      // Also delete associated transactions
      setTransactions(prev => prev.filter(t => t.creditReceivedId !== id));
  };
  
  const deleteCreditReceivedReturnHistory = (entryId: string, historyId: string) => {
    // 1. Update the credit entry itself
    setCreditReceivedEntries(prev => prev.map(e => {
        if (e.id === entryId) {
            const historyItem = e.history.find(h => h.id === historyId);
            if (!historyItem) return e;

            const newReturnedAmount = e.returnedAmount - historyItem.amount;
            const newHistory = e.history.filter(h => h.id !== historyId);
            const newStatus: CreditStatus = newReturnedAmount >= e.amount ? 'completed' : newReturnedAmount > 0 ? 'partially-paid' : 'pending';
            
            return { ...e, returnedAmount: newReturnedAmount, history: newHistory, status: newStatus };
        }
        return e;
    }));
    // 2. Delete the associated transaction
    setTransactions(prev => prev.filter(t => t.creditReceivedHistoryId !== historyId));
  };
  
  // FIX: Implement a safe reset that only clears financial data, not the user session.
  const resetToDefaults = () => {
    // This will erase all transactions, cards, and credit entries,
    // providing a "fresh start" for financial data, not a full factory reset.
    // The user's account, custom categories, and theme preference are preserved.
    setTransactions([]);
    setCards([]);
    setCreditEntries([]);
    setCreditReceivedEntries([]);
    // Restore default categories for convenience, as per user request.
    setCategories(dummyCategories);
  };
  
  const value = {
      user,
      transactions,
      categories,
      cards,
      creditEntries,
      creditReceivedEntries,
      balances,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      addCategory,
      deleteCategory,
      updateCategory,
      addCard,
      deleteCard,
      updateCard,
      addCreditEntry,
      addCreditReturn,
      deleteCreditEntry,
      addCreditReceivedEntry,
      addCreditReceivedReturn,
      deleteCreditReceivedEntry,
      deleteCreditReceivedReturnHistory,
      resetToDefaults,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};