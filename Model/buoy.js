const connection = require("./connection");

async function selectAllRows() {
    // Old Version:
    // let sqlStatement = `SELECT * FROM distance`
    // New Version:
    const sqlStatement = `
        SELECT 
            g.id AS gyro_id,
            g.x_axis,
            g.y_axis,
            g.z_axis,
            g.distance_id,
            d.distance AS distance_value,
            g.gyro_time
        FROM gyro_main g
        INNER JOIN distance d
            ON g.distance_id = d.id
    `;
    return await connection.query(sqlStatement);
}

async function selectById(parameters = {}) {
    // Old Version:
    // const sqlStatement = "SELECT * FROM distance WHERE id = ?"
    // New Version:
    const sqlStatement = `
        SELECT 
            g.id,
            g.x_axis,
            g.y_axis,
            g.z_axis,
            g.distance_id,
            d.distance,
            g.gyro_time
        FROM gyro_main g
        INNER JOIN distance d
            ON g.distance_id = d.id
        WHERE g.id = ?
    `;
    const queryParameters = [parameters.id];
    return await connection.query(sqlStatement, queryParameters);
}

async function addRow(parameters = {}) {                                 // Example table was '340demo' and column was 'info'. Replace these with the names of our table and columns.
    // Old Version:
    // const sqlStatement = "INSERT INTO distance (distance) VALUES (?)"        // Inserts a new row into table, setting only the info column. Whatever you pass in as parameters.info becomes the value for that info column.
    // let queryParameters = [ 
    //     parameters.distance
    // ];
    // New Version:
    const sqlStatement = `INSERT INTO gyro_main (x_axis, y_axis, z_axis, distance_id, gyro_time) VALUES (?, ?, ?, ?, ?)`;
    let queryParameters = [
        parameters.x_axis,
        parameters.y_axis,
        parameters.z_axis,
        parameters.distance_id, // foreign key to distance table, should correspond to an existing distance.id
        parameters.gyro_time    // 'HH:MM:SS' string
    ];

    return await connection.query(sqlStatement, queryParameters);
}

async function updateRow(parameters = {}) {     // probably need to change SET info = ? to SET distance = ? (match the column name in our database)
    // Old Version:
    // const sqlStatement = `UPDATE distance 
    // SET distance = ?
    // WHERE id = ?`

    // let queryParameters = [
    //     parameters.distance,
    //     parameters.id
    // ];
    // New Version:
    const sqlStatement = `UPDATE gyro_main
        SET x_axis = ?, y_axis = ?, z_axis = ?, distance_id = ?, gyro_time = ?
        WHERE id = ?`;
    const queryParameters = [
        parameters.x_axis,
        parameters.y_axis,
        parameters.z_axis,
        parameters.distance_id,
        parameters.gyro_time,
        parameters.id
    ];

    return await connection.query(sqlStatement, queryParameters);
}

async function updateRowKeepTime(parameters = {}) {
    const sqlStatement = `UPDATE gyro_main
        SET x_axis = ?, y_axis = ?, z_axis = ?, distance_id = ?
        WHERE id = ?`;
    const queryParameters = [
        parameters.x_axis,
        parameters.y_axis,
        parameters.z_axis,
        parameters.distance_id,
        parameters.id
    ];

    return await connection.query(sqlStatement, queryParameters);
}

async function deleteRow(parameters = {}) {
    const sqlStatement = "DELETE FROM gyro_main WHERE id = ?"
    const queryParameters = [parameters.id];
    return await connection.query(sqlStatement, queryParameters);
}

async function insertGyroData(x_axis, y_axis, z_axis) {
    const sql = "INSERT INTO gyro_main (x_axis, y_axis, z_axis) VALUES (?, ?, ?)"

    connection.query(sql, [x_axis, y_axis, z_axis], (err, result) => {
        if (err) {
            console.error("Insert failed:", err);
        }
        else {
            console.log("Data inserted:", result.insertID);
        }
    })
}

async function insertDistanceData(distance) {
    const sql = "INSERT INTO distance (distance) VALUES (?)"

    connection.query(sql, [distance], (err, result) => {
        if (err) {
            console.error("Insert failed:", err);
        }
        else {
            console.log("Data inserted:", result.insertID);
        }
    })
}

module.exports = {
    selectAllRows,
    selectById,
    addRow,
    updateRow,
    updateRowKeepTime,
    deleteRow, 
    insertGyroData, 
    insertDistanceData
}