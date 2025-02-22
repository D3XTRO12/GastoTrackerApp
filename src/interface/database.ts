import { Expense, Income } from ".";

export interface DBIncome extends Omit<Income, 'date'> {
    date: string;
  }
  
  export interface DBExpense extends Omit<Expense, 'date' | 'isCredit' | 'isPaid'> {
    date: string;
    isCredit: number;
    isPaid: number;
  }
  
  export type SQLiteResults = {
    rows: {
      _array: any[];
      length: number;
    };
  };