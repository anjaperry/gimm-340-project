const connection = require("./connection");

async function selectAllRows() {
    let sqlStatement = `SELECT * FROM gyro_main`

    return await connection.query(sqlStatement);
}

async function selectById(parameters = {}) {
    const sqlStatement = "SELECT * FROM gyro_main WHERE id = ?"
    const queryParameters = [parameters.id];
    return await connection.query(sqlStatement, queryParameters);
}

async function addRow(parameters = {}) {
    const sqlStatement = "INSERT INTO gyro_main (info) VALUES (?)"
    
    let queryParameters = [ 
        parameters.info
    ];

    return await connection.query(sqlStatement, queryParameters);
}

async function updateRow(parameters = {}) {
    const sqlStatement = `UPDATE gyro_main 
    SET info = ?
    WHERE id = ?`

    let queryParameters = [
        parameters.info,
        parameters.id
    ];

    return await connection.query(sqlStatement, queryParameters);
}

async function deleteRow(parameters = {}) {
    const sqlStatement = "DELETE FROM gyro_main WHERE id = ?"
    const queryParameters = [parameters.id];
    return await connection.query(sqlStatement, queryParameters);
}

module.exports = {
    selectAllRows,
    selectById,
    addRow,
    updateRow,
    deleteRow
}