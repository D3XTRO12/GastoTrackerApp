import {
  db,
  initDatabase,
  addUser,
  getUserById,
  addIncome,
  getIncomesByUser,
  addExpense,
  getExpensesByUser,
  calculateBalance,
  calculateSavings,
} from './database';
import { User, Income, Expense } from '../interface';
import { CreateUserDTO, CreateIncomeDTO, CreateExpenseDTO } from '../dto';

// SQL Helper function
const normalizeSQL = (sql: string) => {
  return sql
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
};

// Mock de expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
  })),
}));

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initDatabase should create tables', async () => {
    await initDatabase();
    const expectedSQL = normalizeSQL(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id)
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        paymentMethod TEXT NOT NULL,
        isCredit INTEGER NOT NULL,
        installments INTEGER,
        installmentAmount REAL,
        isPaid INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
  });

  test('addUser should insert a new user', async () => {
    const userDTO: CreateUserDTO = { 
      name: 'John Doe' 
    };
    await addUser(userDTO);
    
    const expectedSQL = normalizeSQL(`
      INSERT INTO users (name) 
      VALUES ('John Doe')
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
  });

  test('getUserById should return a user', async () => {
    const mockUser: User = { 
      id: 1, 
      name: 'John Doe' 
    };
    (db.execAsync as jest.Mock).mockResolvedValueOnce([{
      rows: { _array: [mockUser], length: 1 }
    }]);

    const user = await getUserById(1);
    const expectedSQL = normalizeSQL(`
      SELECT * FROM users 
      WHERE id = 1
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
    expect(user).toEqual(mockUser);
  });

  test('addIncome should insert a new income', async () => {
    const incomeDTO: CreateIncomeDTO = {
      userId: 1,
      amount: 1000,
      date: new Date('2023-10-01'),
    };
    await addIncome(incomeDTO);
    
    const expectedSQL = normalizeSQL(`
      INSERT INTO incomes (userId, amount, date) 
      VALUES (
        1, 
        1000, 
        '2023-10-01T00:00:00.000Z'
      )
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
  });

  test('getIncomesByUser should return incomes for a user', async () => {
    const mockIncomes = [
      { id: 1, userId: 1, amount: 1000, date: '2023-10-01T00:00:00.000Z' }
    ];
    (db.execAsync as jest.Mock).mockResolvedValueOnce([{
      rows: { _array: mockIncomes, length: mockIncomes.length }
    }]);

    const incomes = await getIncomesByUser(1);
    const expectedSQL = normalizeSQL(`
      SELECT * FROM incomes 
      WHERE userId = 1
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
    expect(incomes).toEqual([
      { id: 1, userId: 1, amount: 1000, date: new Date('2023-10-01T00:00:00.000Z') }
    ]);
  });

  test('addExpense should insert a new expense', async () => {
    const expenseDTO: CreateExpenseDTO = {
      userId: 1,
      amount: 500,
      date: new Date('2023-10-01'),
      category: 'Food',
      description: 'Groceries',
      paymentMethod: 'Credit Card',
      isCredit: true,
      installments: 3,
      installmentAmount: 166.67,
      isPaid: false,
    };
    await addExpense(expenseDTO);
    
    const expectedSQL = normalizeSQL(`
      INSERT INTO expenses (
        userId, 
        amount, 
        date, 
        category, 
        description, 
        paymentMethod,
        isCredit, 
        installments, 
        installmentAmount, 
        isPaid
      ) VALUES (
        1,
        500,
        '2023-10-01T00:00:00.000Z',
        'Food',
        'Groceries',
        'Credit Card',
        1,
        3,
        166.67,
        0
      )
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
  });

  test('getExpensesByUser should return expenses for a user', async () => {
    const mockExpenses = [
      {
        id: 1,
        userId: 1,
        amount: 500,
        date: '2023-10-01T00:00:00.000Z',
        category: 'Food',
        description: 'Groceries',
        paymentMethod: 'Credit Card',
        isCredit: 1,
        installments: 3,
        installmentAmount: 166.67,
        isPaid: 0,
      },
    ];
    (db.execAsync as jest.Mock).mockResolvedValueOnce([{
      rows: { _array: mockExpenses, length: mockExpenses.length }
    }]);

    const expenses = await getExpensesByUser(1);
    const expectedSQL = normalizeSQL(`
      SELECT * FROM expenses 
      WHERE userId = 1
    `);
    const receivedSQL = normalizeSQL((db.execAsync as jest.Mock).mock.calls[0][0]);
    expect(receivedSQL).toBe(expectedSQL);
    expect(expenses).toEqual([
      {
        id: 1,
        userId: 1,
        amount: 500,
        date: new Date('2023-10-01T00:00:00.000Z'),
        category: 'Food',
        description: 'Groceries',
        paymentMethod: 'Credit Card',
        isCredit: true,
        installments: 3,
        installmentAmount: 166.67,
        isPaid: false,
      },
    ]);
  });

  test('calculateBalance should return the correct balance', async () => {
    const mockIncomes = [
      { id: 1, userId: 1, amount: 1000, date: '2023-10-01T00:00:00.000Z' }
    ];
    const mockExpenses = [
      {
        id: 1,
        userId: 1,
        amount: 500,
        date: '2023-10-01T00:00:00.000Z',
        category: 'Food',
        description: 'Groceries',
        paymentMethod: 'Credit Card',
        isCredit: 1,
        installments: 3,
        installmentAmount: 166.67,
        isPaid: 0,
      },
    ];
    (db.execAsync as jest.Mock)
      .mockResolvedValueOnce([{ rows: { _array: mockIncomes, length: mockIncomes.length } }])
      .mockResolvedValueOnce([{ rows: { _array: mockExpenses, length: mockExpenses.length } }]);

    const balance = await calculateBalance(1);
    expect(balance).toBe(500);
  });

  test('calculateSavings should return the correct savings', async () => {
    const mockIncomes = [
      { id: 1, userId: 1, amount: 1000, date: '2023-10-01T00:00:00.000Z' }
    ];
    const mockExpenses = [
      {
        id: 1,
        userId: 1,
        amount: 500,
        date: '2023-10-01T00:00:00.000Z',
        category: 'Food',
        description: 'Groceries',
        paymentMethod: 'Credit Card',
        isCredit: 1,
        installments: 3,
        installmentAmount: 166.67,
        isPaid: 1,
      },
    ];
    (db.execAsync as jest.Mock)
      .mockResolvedValueOnce([{ rows: { _array: mockIncomes, length: mockIncomes.length } }])
      .mockResolvedValueOnce([{ rows: { _array: mockExpenses, length: mockExpenses.length } }]);

    const savings = await calculateSavings(1);
    expect(savings).toBe(500);
  });
});