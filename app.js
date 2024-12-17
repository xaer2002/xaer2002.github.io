const mysql = require('mysql2');
const readline = require('readline');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Pyro2002',
  database: 'librarydb' // Database name
});

// Setup readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to format the date as YYYY-MM-DD (MySQL compatible)
function formatDateForMySQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
}

// Function to authenticate a user
function authenticateUser(username, password, callback) {
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error during authentication:', err.stack);
      callback(err, false);
    } else {
      callback(null, results.length > 0); // If results.length > 0, user is authenticated
    }
  });
}

// Function to handle book search
function searchBook(title, callback) {
  const query = 'SELECT * FROM library WHERE book_title LIKE ?';
  connection.query(query, [`%${title}%`], (err, results) => {
    if (err) {
      console.error('Error searching for book:', err.stack);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Function to update the checkout status and date
function checkoutBook(title, checkout, callback) {
  const date = new Date(); // Current date
  const formattedDate = formatDateForMySQL(date); // Use MySQL-compatible format

  const query = 'UPDATE library SET book_checkout = ?, checkout_date = ? WHERE book_title = ?';
  connection.query(query, [checkout, formattedDate, title], (err, result) => {
    if (err) {
      console.error('Error updating checkout status:', err.stack);
      callback(err);
    } else {
      callback(null, result.affectedRows > 0, formattedDate);
    }
  });
}

// Start the authentication process
rl.question('Enter your username: ', (username) => {
  rl.question('Enter your password: ', (password) => {
    authenticateUser(username, password, (err, isAuthenticated) => {
      if (err || !isAuthenticated) {
        console.log('Invalid username or password. Exiting...');
        rl.close();
        connection.end();
        return;
      }

      console.log('Login successful!');

      // Start interactive process after login
      rl.question('Enter the title of the book: ', (title) => {
        searchBook(title, (err, books) => {
          if (err) {
            console.log('Failed to fetch books. Please try again.');
            rl.close();
            return;
          }

          if (books.length === 0) {
            console.log('No books found with that title.');
            rl.close();
            return;
          }

          console.log('Books found:');
          books.forEach((book, index) => {
            console.log(`${index + 1}. Title: ${book.book_title}, Author(s): ${book.book_authors}, Checkout: ${book.book_checkout ? 'Checked Out' : 'Available'}, Rating: ${book.rating}, Checked Out Date: ${book.checkout_date || 'N/A'}`);
          });

          rl.question('Enter checkout status (0 for not checked out, 1 for checked out): ', (checkout) => {
            checkout = parseInt(checkout);
            if (checkout !== 0 && checkout !== 1) {
              console.log('Invalid checkout status. Please enter 0 or 1.');
              rl.close();
              connection.end();
              return;
            }

            checkoutBook(title, checkout, (err, success, date) => {
              if (err) {
                console.log('Failed to update checkout status.');
              } else if (success) {
                console.log(`Checkout status updated successfully. Date of change: ${date}`);
              } else {
                console.log('No book found with the given title.');
              }
              rl.close();
              connection.end();
            });
          });
        });
      });
    });
  });
});
