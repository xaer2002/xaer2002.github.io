









const mysql = require('mysql2');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

// Database connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'Pyro2002', // Replace with your MySQL password
  database: 'librarydb' // Replace with your database name
});

// CSV Writer setup
const csvWriter = createObjectCsvWriter({
  path: 'exported_data.csv', // The path and name of the output CSV file
  header: [
    { id: 'book_title', title: 'Book Title' },
    { id: 'book_authors', title: 'Book Authors' },
    { id: 'book_checkout', title: 'Book Checkout' },
    { id: 'rating', title: 'Rating' }
  ]
});

// Query the data and write it to CSV
connection.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }

  console.log('Connected to the database.');

  const query = 'SELECT * FROM Library';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      connection.end();
      return;
    }

    // Write data to CSV
    csvWriter.writeRecords(results)
      .then(() => {
        console.log('Data has been written to exported_data.csv');
      })
      .catch(error => console.error('Error writing to CSV:', error))
      .finally(() => connection.end());
  });
});
