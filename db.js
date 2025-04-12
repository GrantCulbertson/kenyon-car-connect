//Load in necessary packages:
const mariadb = require('mariadb');
require('dotenv').config();

//Connect to Database
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
  waitForConnections: true
});


//Function to query database:
async function query(sql, params) {
	let conn;
	try {
		conn = await pool.getConnection();
		const rows = await conn.query(sql, params);
		return rows;
	} catch (err) {
		console.error(err);
		throw err;
	} finally {
		if (conn) {
			conn.release();
		}
	}
}



//Export Query Function
module.exports = { pool , query };