// Import mysql2 package
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost', // Database server
  user: 'root', // Your MySQL username
  password: 'Pyro2002', // Your MySQL password
  database: 'librarydb' // Your database name
});


// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Query the data and write to CSV
connection.query("SELECT * FROM library", (err, results) => {
    if (err) {
        console.error("Error executing query:", err);
        return;
    }

    // Stream the data to a CSV file
    const csvStream = format({ headers: true });
    const writableStream = fs.createWriteStream("library_data.csv");

    writableStream.on("finish", () => {
        console.log("Data exported to library_data.csv successfully!");
    });

    csvStream.pipe(writableStream);
    results.forEach(row => {
        csvStream.write(row); // Write each row of the query result
    });
    csvStream.end();

    // Close the database connection after exporting
    connection.end((err) => {
        if (err) {
            console.error('Error closing the connection:', err);
        } else {
            console.log('Database connection closed');
        }
    });
});
