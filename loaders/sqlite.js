const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;
const dbFile = path.join(__dirname, 'whois.db');

// Function to initialize and connect to the SQLite database
async function connect() {
    if (!db) {
        db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                throw err;
            } else {
                console.log('Connected to the whois database.');
            }
        });

        // Create the table if it doesn't exist
        await new Promise((resolve, reject) => {
            db.run(
                `CREATE TABLE IF NOT EXISTS domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          domain STRING(255),
          email TEXT,
          expiry DATETIME,
          last_updated DATETIME,
          register_at DATETIME,
          cron_updated_at DATETIME,
          email_sent_at DATETIME,
          requested_by STRING(255),
          created_at DATETIME,
          updated_at DATETIME
        )`,
                (err) => {
                    if (err) {
                        console.error('Error creating table:', err);
                        reject(err);
                    } else {
                        console.log('Table "domains" created or already exists.');
                        resolve();
                    }
                }
            );
        });
    }
}

// Generic function to insert a record
async function insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

    try {
        await new Promise((resolve, reject) => {
            db.run(query, values, function (err) {
                if (err) {
                    console.error('Error inserting record:', err);
                    reject(err);
                } else {
                    console.log('Record inserted successfully.');
                    resolve(this.lastID);
                }
            });
        });
    } catch (error) {
        throw new Error(`Insert failed: ${error.message}`);
    }
}

async function insertMany(table, data) {
    if (data.length === 0) {
        throw new Error('No data provided for insertion.');
    }

    // Construct columns and placeholders
    const columns = Object.keys(data[0]).join(', ');
    const placeholders = data
        .map(() => `(${Object.keys(data[0]).map(() => '?').join(', ')})`)
        .join(', ');

    // Flatten the values from all objects in data
    const values = data.map((d) => Object.values(d)).flat();

    // Construct the final query
    const query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`;

    try {
        await new Promise((resolve, reject) => {
            db.run(query, values, function (err) {
                if (err) {
                    console.error('Error inserting records:', err);
                    reject(err);
                } else {
                    console.log('Records inserted successfully.');
                    resolve(this.lastID);
                }
            });
        });
    } catch (error) {
        throw new Error(`Insert failed: ${error.message}`);
    }
}


// Generic function to execute an update query
async function update(query, params = []) {
    try {
        await new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) {
                    console.error('Error updating record:', err);
                    reject(err);
                } else {
                    console.log('Record updated successfully.');
                    resolve();
                }
            });
        });
    } catch (error) {
        throw new Error(`Update failed: ${error.message}`);
    }
}

// Generic function to execute a delete query
async function deleteBy(query, params = []) {
    try {
        await new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) {
                    console.error('Error deleting record:', err);
                    reject(err);
                } else {
                    console.log('Record deleted successfully.');
                    resolve();
                }
            });
        });
    } catch (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

// Generic function to execute a find query
async function find(query, params = []) {
    try {
        return await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Error finding records:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    } catch (error) {
        throw new Error(`Find failed: ${error.message}`);
    }
}

// Export the functions
module.exports = {
    connect,
    update,
    deleteBy,
    find,
    insertMany,
};
