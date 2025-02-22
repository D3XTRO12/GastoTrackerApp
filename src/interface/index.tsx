export interface User {
    id: number;
    name: string;
  }
  
  export interface Income {
    id: number;
    userId: number;
    amount: number;
    category: string;
    name: string;
  }
  
  export interface Expense {
    id: number;
    userId: number;
    amount: number;
    date: Date;
    category: string;
    name: string;
    paymentMethod: string;
    isCredit: boolean;
    installments: number;
    installmentAmount: number;
    isPaid: boolean;
  }