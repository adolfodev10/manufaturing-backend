import { open } from "sqlite";
const sqlite3 = require('sqlite3').verbose();

export const openDb = async () => {
    const db = await open({
        filename: process.env.DATABASE_URL || './database.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            funcao TEXT CHECK(funcao IN('Farmacêutico(a)', 'Gerente', 'Balconista', 'Limpeza')),
            senha TEXT NOT NULL
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS registerProduct (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        description TEXT NOT NULL
        )
        `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nameClient TEXT NOT NULL UNIQUE,
            telefone INTEGER NOT NULL
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            description TEXT NOT NULL,
            client_id INTEGER,
            FOREIGN KEY (client_id) REFERENCES clients (id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            date TEXT NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients (id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            product_id INTEGER,
            FOREIGN KEY (invoice_id) REFERENCES invoices (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    `);
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date DATETIME NOT NULL
        )
        `)
    return db
};

export const getDb = async () => {
    return await openDb()
};
