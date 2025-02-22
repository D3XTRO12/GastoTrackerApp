import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';
import { User, Income, Expense } from '../interface';
import { DBIncome, DBExpense, SQLiteResults } from '../interface/database';
import { CreateUserDTO, CreateIncomeDTO, CreateExpenseDTO } from '../dto';

// Nombre de la base de datos
const DB_NAME = 'gastos.db';

// Abrimos la base de datos
export let db: SQLite.SQLiteDatabase;

// Inicializa la base de datos
export const initDatabase = async (): Promise<void> => {
  try {
    if (__DEV__) {
      // En desarrollo, usar directamente SQLite
      db = SQLite.openDatabaseSync(DB_NAME);
      await createTables();
    } else {
      // En producción, copiar la base pre-poblada
      const dbFolder = `${FileSystem.documentDirectory}SQLite`;
      const dbPath = `${dbFolder}/${DB_NAME}`;
      
      const folderInfo = await FileSystem.getInfoAsync(dbFolder);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(dbFolder);
      }
      
      const dbExists = await FileSystem.getInfoAsync(dbPath);
      if (!dbExists.exists) {
        // Copiar desde assets solo si no existe
        const asset = require('../../assets/db/gastos.db');
        const assetModule = await Asset.Asset.loadAsync(asset);
        await FileSystem.copyAsync({
          from: assetModule[0].localUri!,
          to: dbPath
        });
      }
      
      db = SQLite.openDatabaseSync(DB_NAME);
    }

    await createTables();
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Función para crear las tablas
const createTables = async (): Promise<void> => {
  try {
    await db.execAsync(`
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
  } catch (error) {
    console.error('Error al crear las tablas:', error);
    throw error;
  }
};

// Operaciones para User
export const addUser = async (userData: CreateUserDTO): Promise<void> => {
  try {
    await db.execAsync(`
      INSERT INTO users (name) 
      VALUES ('${userData.name}')
    `);
    console.log('Usuario agregado correctamente');
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    throw error;
  }
};

// Función para verificar que la base de datos funciona
export const verifyDatabase = async (): Promise<void> => {
  try {
    const result = await db.execAsync('SELECT * FROM users LIMIT 1');
    console.log('Verificación de base de datos exitosa:', result);
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const result = await db.execAsync(`
      SELECT * FROM users 
      WHERE id = ${id}
    `) as unknown as SQLiteResults[];
    
    if (result?.[0]?.rows?._array?.length > 0) {
      return result[0].rows._array[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Operaciones para Income
export const addIncome = async (incomeData: CreateIncomeDTO): Promise<void> => {
  try {
    await db.execAsync(`
      INSERT INTO incomes (userId, amount, date) 
      VALUES (
        ${incomeData.userId}, 
        ${incomeData.amount}, 
        '${incomeData.date.toISOString()}'
      )
    `);
    console.log('Ingreso agregado correctamente');
  } catch (error) {
    console.error('Error al agregar ingreso:', error);
    throw error;
  }
};

export const getIncomesByUser = async (userId: number): Promise<Income[]> => {
  try {
    const result = await db.execAsync(`
      SELECT * FROM incomes 
      WHERE userId = ${userId}
    `) as unknown as SQLiteResults[];

    if (!result?.[0]?.rows?._array) return [];
    
    return result[0].rows._array.map((row: DBIncome) => ({
      ...row,
      date: new Date(row.date)
    }));
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    throw error;
  }
};

// Operaciones para Expense
export const addExpense = async (expenseData: CreateExpenseDTO): Promise<void> => {
  try {
    await db.execAsync(`
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
        ${expenseData.userId},
        ${expenseData.amount},
        '${expenseData.date.toISOString()}',
        '${expenseData.category}',
        '${expenseData.description || ''}',
        '${expenseData.paymentMethod}',
        ${expenseData.isCredit ? 1 : 0},
        ${expenseData.installments || 0},
        ${expenseData.installmentAmount || 0},
        ${expenseData.isPaid ? 1 : 0}
      )
    `);
    console.log('Gasto agregado correctamente');
  } catch (error) {
    console.error('Error al agregar gasto:', error);
    throw error;
  }
};

export const getExpensesByUser = async (userId: number): Promise<Expense[]> => {
  try {
    const result = await db.execAsync(`
      SELECT * FROM expenses 
      WHERE userId = ${userId}
    `) as unknown as SQLiteResults[];

    if (!result?.[0]?.rows?._array) return [];

    return result[0].rows._array.map((row: DBExpense) => ({
      ...row,
      date: new Date(row.date),
      isCredit: Boolean(row.isCredit),
      isPaid: Boolean(row.isPaid)
    }));
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    throw error;
  }
};

// Funciones de cálculo
export const calculateBalance = async (userId: number): Promise<number> => {
  try {
    const incomes = await getIncomesByUser(userId);
    const expenses = await getExpensesByUser(userId);

    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return totalIncomes - totalExpenses;
  } catch (error) {
    console.error('Error al calcular el balance:', error);
    throw error;
  }
};

export const calculateSavings = async (userId: number): Promise<number> => {
  try {
    const incomes = await getIncomesByUser(userId);
    const expenses = await getExpensesByUser(userId);

    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpensesPaid = expenses
      .filter(expense => expense.isPaid)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return totalIncomes - totalExpensesPaid;
  } catch (error) {
    console.error('Error al calcular los ahorros:', error);
    throw error;
  }
};
export const agregarGastoDePrueba = async (): Promise<void> => {
  const gastoDePrueba: Expense = {
    id: 0, // ID autogenerado
    userId: 1, // ID del usuario
    amount: 100, // Monto del gasto
    date: new Date(), // Fecha actual
    category: 'Comida', // Categoría del gasto
    description: 'Almuerzo', // Descripción del gasto
    paymentMethod: 'Cash', // Método de pago
    isCredit: false, // No es a crédito
    installments: 0, // Número de cuotas (0 si no es a crédito)
    installmentAmount: 0, // Monto de la cuota (0 si no es a crédito)
    isPaid: true, // El gasto está pagado
  };

  try {
    await db.execAsync(`
      INSERT INTO expenses (
        userId, amount, date, category, description, paymentMethod,
        isCredit, installments, installmentAmount, isPaid
      ) VALUES (
        ${gastoDePrueba.userId},
        ${gastoDePrueba.amount},
        '${gastoDePrueba.date.toISOString()}',
        '${gastoDePrueba.category}',
        '${gastoDePrueba.description}',
        '${gastoDePrueba.paymentMethod}',
        ${gastoDePrueba.isCredit ? 1 : 0},
        ${gastoDePrueba.installments},
        ${gastoDePrueba.installmentAmount},
        ${gastoDePrueba.isPaid ? 1 : 0}
      )
    `);
    console.log('Gasto de prueba agregado correctamente.');
  } catch (error) {
    console.error('Error al agregar gasto de prueba:', error);
  }
};