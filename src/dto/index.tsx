export interface CreateUserDTO {
  name: string;
}

export interface CreateIncomeDTO {
  userId: number;
  amount: number;
  date: Date;
}

export interface CreateExpenseDTO {
  userId: number;
  amount: number;
  date: Date;
  category: string;
  description: string;
  paymentMethod: string;
  isCredit: boolean;
  installments: number;
  installmentAmount: number;
  isPaid: boolean;
}