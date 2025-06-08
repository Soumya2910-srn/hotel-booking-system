const cart = [];

// Add items to cart
function addToCart(item, price) {
    console.log(`Adding to cart: ${item} - ₹${price}`);
    cart.push({ item, price });
    updateCart();
}

// Update cart UI
function updateCart() {
    const cartTableBody = document.getElementById("cartItemsTable");
    const totalAmount = document.getElementById("totalAmount");

    cartTableBody.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartTableBody.innerHTML = "<tr><td colspan='3'>No items in cart</td></tr>";
        totalAmount.textContent = "0";
        return;
    }

    cart.forEach((cartItem, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${cartItem.item}</td>
            <td>₹${cartItem.price}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
        `;
        cartTableBody.appendChild(row);
        total += cartItem.price;
    });

    totalAmount.textContent = total;
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Place food order
async function placeOrder() {
    const userId = localStorage.getItem("loggedInUser");
    const roomNumberInput = document.getElementById("roomNumber");
    const roomNumber = roomNumberInput ? roomNumberInput.value.trim() : "";

    if (!userId) {
        alert("User not logged in!");
        return;
    }

    if (!roomNumber || isNaN(roomNumber) || roomNumber <= 0) {
        alert("Please enter a valid room number.");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/place-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, roomNumber, cart })
        });

        const result = await response.json();
        alert(result.message);

        if (result.success) {
            cart.length = 0; // Clear cart after order
            updateCart();
            fetchOrders(); // Refresh order table
        }
    } catch (error) {
        console.error("Error placing order:", error);
        alert("Error placing order.");
    }
}

// Fetch and display user's orders
async function fetchOrders() {
    const userId = localStorage.getItem("loggedInUser");
    if (!userId) return;

    try {
        const response = await fetch(`/get-orders/${userId}`);
        const data = await response.json();
        console.log("Orders fetched:", data);

        const orderTable = document.getElementById("orderTable");
        orderTable.innerHTML = "";

        if (data.success && data.orders.length > 0) {
            data.orders.forEach(order => {
                orderTable.innerHTML += `
                    <tr>
                        <td>${order.room_number}</td>
                        <td>${order.item_name}</td>
                        <td>₹${order.price}</td>
                        <td>${order.order_time}</td>
                    </tr>`;
            });
        } else {
            orderTable.innerHTML = "<tr><td colspan='4'>No orders found.</td></tr>";
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

// Load orders on page load
document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded successfully!");
    fetchOrders();
});
