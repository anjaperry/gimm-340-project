const mysql = require('mysql2/promise');

let connection = null;

async function query(sql, params) {
    //Singleton DB connection
    if (null === connection) {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
            user: "harveyholm",
            password: "V7gDEzqTdc9G5qKfJ1rZWbTpR69ENUr8GzE",
            database: 'harveyholm',
            connectTimeout: 3000, // 3 seconds untill timeout
        });
        console.log('Connected to database');
    }
    sql = mysql.format(sql, params);
    console.log('Executing query:', sql); //not sure what this is doing
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    }
   catch (error) {
        console.error('Query failed:', error);
        throw error;
   }
}

module.exports = {
    query,
}
