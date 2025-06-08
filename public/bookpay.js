document.addEventListener("DOMContentLoaded", function () {
     const roomPrices = {
         'AC Single Bed': 5000,
         'AC Double Bed': 7500,
         'Non-AC Single Bed': 3500,
         'Non-AC Double Bed': 4500
     };
 
     const roomTypeSelect = document.getElementById('roomType');
     const priceDisplay = document.getElementById('priceDisplay');
     const bookButton = document.getElementById('bookButton');
 
     if (!roomTypeSelect || !priceDisplay || !bookButton) {
         console.error('Error: Required elements not found!');
         return;
     }
 
     roomTypeSelect.addEventListener('change', function () {
         const selectedRoom = this.value;
         const price = roomPrices[selectedRoom] || 0;
         priceDisplay.textContent = `Price: ₹${price}`;
     });
 
     bookButton.addEventListener("click", async function (event) {
         event.preventDefault(); // Prevent default form submission
         console.log("Book button clicked. Submitting forms...");
         await submitForms(roomPrices);
     });
 });
 
 async function submitForms(roomPrices) {
     console.log("submitForms function triggered.");
     const userId = document.getElementById('userId')?.value.trim();
     const name = document.getElementById('name')?.value.trim();
     const phone = document.getElementById('phone')?.value.trim();
     const email = document.getElementById('email')?.value.trim();
     const roomType = document.getElementById('roomType')?.value;
     const date = document.getElementById('date')?.value;
     const paymentType = document.getElementById('paymentType')?.value;
     const transactionId = document.getElementById('transactionId')?.value.trim();
     const receipt = document.getElementById('receipt')?.files[0];
 
     if (!roomType || !(roomType in roomPrices)) {
         alert('Please select a valid room type.');
         return;
     }
 
     const price = roomPrices[roomType];

    
     if (!userId || !name || !phone || !email || !roomType || !date) {
         alert('Please fill out all booking details.');
         return;
     }
     if (!paymentType || !transactionId || !receipt) {
         alert('Please fill out all payment details and upload the receipt.');
         return;
     }
 
     const formData = new FormData();
     formData.append('userId', userId);
     formData.append('name', name);
     formData.append('phone', phone);
     formData.append('email', email);
     formData.append('roomType', roomType);
     formData.append('price', price);
     formData.append('date', date);
     formData.append('paymentType', paymentType);
     formData.append('transactionId', transactionId);
     formData.append('receipt', receipt);
 
     try {
         console.log("Sending data to server...");
         const response = await fetch('http://localhost:5000/book-room', {
             method: 'POST',
             body: formData
         });
 
         const result = await response.json();
         console.log("Server Response:", result);
         if (response.ok) {
            localStorage.setItem("loggedInUser", userId); // Fix undefined variable issue
            window.location.href = "bookings.html";
        } else {
            alert(result.message || "Failed to save booking. Try again."); // Show server error message if available
        }
        

     } catch (error) {
         console.error('Error:', error);
         alert('An error occurred while booking.');
     }
 }
 