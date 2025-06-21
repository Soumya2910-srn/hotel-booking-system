const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // or your folder name

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // or your folder
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Somya@2005",
    database: "hotel_db"
});

db.connect(err => {
    if (err) {
        console.error("Database connection error:", err);
        return;
    }
    console.log("Connected to MySQL Database.");
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landingpage.html'));
});

app.post('/signup', async (req, res) => {
    const { userId, password, name, userType } = req.body;

    if (!userId || !password || !name || !userType) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const checkQuery = `SELECT * FROM users WHERE userId = ?`;
    db.query(checkQuery, [userId], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'User ID already exists.' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = `INSERT INTO users (userId, password, name, userType) VALUES (?, ?, ?, ?)`;

            db.query(insertQuery, [userId, hashedPassword, name, userType], (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Error creating account.' });

                res.json({ success: true, message: 'Signup successful! You can now log in.' });
            });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Error processing request.' });
        }
    });
});

// Login Route
app.post('/login', async (req, res) => {
    const { userId, password, userType } = req.body;

    // Fetch user by userId (ignore userType for now)
    const query = `SELECT * FROM users WHERE userId = ?`;
    db.query(query, [userId], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = results[0];

        
        if (user.userType !== userType) {
            return res.status(401).json({ success: false, message: 'Incorrect user type. Please select the correct user type.' });
        }

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({ success: true, message: `${userType} login successful` });
    });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure the 'uploads' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Define upload variable using multer
const upload = multer({ storage: storage });

// Route: Store Booking Data in Database
app.post('/book-room', upload.single('receipt'), (req, res) => {
    const { userId, name, phone, email, roomType, price, date, paymentType, transactionId } = req.body;
    const receipt = req.file ? req.file.filename : null;

    if (!userId || !name || !phone || !email || !roomType || !price || !date || !paymentType || !transactionId || !receipt) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the transaction ID already exists
    const checkSql = 'SELECT * FROM bookings WHERE transaction_id = ?';
    db.query(checkSql, [transactionId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Transaction ID already used. Please enter a unique Transaction ID.' });
        }

        // Insert new booking if transaction_id is unique
        const sql = 'INSERT INTO bookings (user_id, name, phone, email, room_type, price, booking_date, payment_type, transaction_id, receipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [userId, name, phone, email, roomType, price, date, paymentType, transactionId, receipt], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, message: 'Booking successful!' });
        });
    });
});

// Route: Retrieve Bookings for Logged-in User
app.get('/get-bookings/:userId', (req, res) => {
    const userId = req.params.userId;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const sql = 'SELECT user_id, name, email, phone, room_type, price, booking_date, payment_type FROM bookings WHERE user_id = ?';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ success: true, bookings: [] });
        }

        res.json({ success: true, bookings: results });
    });
});


// Route: Retrieve Bookings for Logged-in User
// Route to place a food order
app.post('/place-order', (req, res) => {
    const { userId, roomNumber, cart } = req.body;

    if (!userId || !roomNumber || !cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid order details" });
    }

    console.log("Received Order:", { userId, roomNumber, cart });

    const sql = 'INSERT INTO food_orders (user_id, room_number, item_name, price) VALUES (?, ?, ?, ?)';

    cart.forEach(item => {
        db.query(sql, [userId, roomNumber, item.item, item.price], (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
        });
    });

    res.json({ success: true, message: "Order placed successfully!" });
});

// Route to get orders for a specific user
app.get('/get-orders/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM food_orders WHERE user_id = ? ORDER BY order_time DESC';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, orders: results });
    });
});

app.get('/get-all-bookings', (req, res) => {
    const sql = 'SELECT user_id, name, email, phone, room_type, price, booking_date, payment_type FROM bookings';

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ success: true, bookings: [] });
        }

        res.json({ success: true, bookings: results });
    });
});

app.get('/get-all-orders', (req, res) => {
    const sql = 'SELECT  user_id, room_number, item_name, price, order_time FROM food_orders ';

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ success: true, orders: [] });
        }

        res.json({ success: true, orders: results });
    });
});

app.delete('/delete-booking-user/:userId', (req, res) => {
    const { userId } = req.params;

    console.log(`Received request to delete user: ${userId}`);

    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ success: false, message: 'Database transaction error' });
        }

        // Step 1: Delete all bookings for the user
        const deleteBookingSQL = 'DELETE FROM bookings WHERE user_id = ?';
        db.query(deleteBookingSQL, [userId], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Booking deletion error:", err);
                    res.status(500).json({ success: false, message: 'Error deleting booking' });
                });
            }

            console.log(`Deleted bookings for user: ${userId}`);

            // Step 2: Delete the user
            const deleteUserSQL = 'DELETE FROM users WHERE userId = ?';
            db.query(deleteUserSQL, [userId], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("User deletion error:", err);
                        res.status(500).json({ success: false, message: 'Error deleting user' });
                    });
                }

                console.log(`Deleted user: ${userId}`);

                // Commit the transaction
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Transaction commit error:", err);
                            res.status(500).json({ success: false, message: 'Error finalizing transaction' });
                        });
                    }

                    console.log(`Successfully removed user and bookings: ${userId}`);
                    res.json({ success: true, message: 'Booking and user removed successfully!' });
                });
            });
        });
    });
});

app.delete('/delete-order/:userId/:itemName', (req, res) => {
    const { userId, itemName } = req.params;

    console.log(`Received request to delete order for user: ${userId}, item: ${itemName}`);

    const deleteOrderSQL = 'DELETE FROM food_orders WHERE user_id = ? AND item_name = ?';

    db.query(deleteOrderSQL, [userId, itemName], (err, result) => {
        if (err) {
            console.error("Database error while deleting order:", err.sqlMessage);
            return res.status(500).json({ success: false, message: `Database error: ${err.sqlMessage}` });
        }

        if (result.affectedRows === 0) {
            console.warn(`Order not found for user: ${userId}, item: ${itemName}`);
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        console.log(`Order deleted successfully for user: ${userId}, item: ${itemName}`);
        res.json({ success: true, message: 'Order removed successfully!' });
    });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
