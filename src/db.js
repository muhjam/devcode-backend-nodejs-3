const mysql = require('mysql2/promise');

// koneksi ke database mysql
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    database: process.env.MYSQL_DBNAME || 'contact-manager',
    password: process.env.MYSQL_PASSWORD || '123123',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// migrasi database mysql
const migration = async () => {
    try {
        // query mysql untuk membuat table contacts
        await db.query(
            `
            CREATE TABLE IF NOT EXISTS contacts (
            id int not null auto_increment,
            full_name varchar(255) not null,
            phone_number varchar(255) not null,
            email varchar(255) not null,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            primary key (id)
            )
        `
        );
        console.log('Running Migration Successfully!');
    } catch (err) {
        throw err;
    }
};

// TODO: Lengkapi fungsi dibawah ini untuk mengambil data didalam database
const find = async () => {
    const query = 'SELECT * FROM contacts';
    const connection = await db.getConnection();
    const [results] = await connection.query(query);
    connection.release();
    const formattedResults = results.map((result) => ({
        id: result.id,
        full_name: result.full_name,
        phone_number: result.phone_number,
        email: result.email,
    }));

    return formattedResults;
};

// TODO: Lengkapi fungsi dibawah ini untuk menyimpan data kedalam database
const create = async (data) => {
    const query =
        'INSERT INTO contacts (full_name, phone_number, email) VALUES (?, ?, ?)';
    const connection = await db.getConnection();

    const { full_name, phone_number, email } = {
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
    };
    const results = await connection.query(query, [
        full_name,
        phone_number,
        email,
    ]);

    return {
        id: results[0].insertId,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
    };
};

const search = async (searchQuery) => {
    const query =
        'SELECT * FROM contacts WHERE id LIKE ? OR full_name LIKE ? OR phone_number LIKE ? OR email LIKE ?';
    const connection = await db.getConnection();
    const q = '%' + searchQuery + '%';
    const [results] = await connection.query(query, [q, q, q, q]);

    connection.release();
    const formattedResults = results.map((result) => ({
        id: result.id,
        full_name: result.full_name,
        phone_number: result.phone_number,
        email: result.email,
    }));

    return formattedResults;
};

const deleteValue = async (id) => {
    const query = 'DELETE FROM contacts WHERE contacts.id = ?';
    const connection = await db.getConnection();
    await connection.query(query, id);
    connection.release();

    return id;
};

module.exports = { migration, find, create, search, deleteValue };
