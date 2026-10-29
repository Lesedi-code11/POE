document.addEventListener('DOMContentLoaded', function() {

    /*1. SHOPPING CART LOGIC*/
    const cartItemsContainer = document.getElementById('cartItems');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const clearCartBtn = document.getElementById('clearCartBtn');

    // Load cart from LocalStorage (or start empty)
    let cart = JSON.parse(localStorage.getItem('sowetoCart')) || [];

    // Function to display cart items
    function displayCart() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = ''; // Clear current list

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<li style="color: #666; font-style: italic;">Your cart is currently empty.</li>';
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.padding = '10px 0';
            li.style.borderBottom = '1px solid #E5E5E5';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            li.innerHTML = `
                <span style="color: #1A1A1A;"><strong>${item.name}</strong> - R${item.price}</span>
                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #E74C3C; cursor: pointer; font-size: 14px; font-weight: bold; text-decoration: underline;">Remove</button>
            `;
            cartItemsContainer.appendChild(li);
            total += parseFloat(item.price);
        });

        // Add Total line
        const totalLi = document.createElement('li');
        totalLi.style.paddingTop = '15px';
        totalLi.style.fontWeight = 'bold';
        totalLi.style.color = '#1A1A1A';
        totalLi.style.display = 'flex';
        totalLi.style.justifyContent = 'space-between';
        totalLi.innerHTML = `<span>Total Estimate:</span> <span>R${total}</span>`;
        cartItemsContainer.appendChild(totalLi);
    }

    // Add to cart button click
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productName = this.getAttribute('data-product');
                const productPrice = this.getAttribute('data-price');

                // Add to array
                cart.push({ name: productName, price: productPrice });
                
                // Save to browser memory
                localStorage.setItem('sowetoCart', JSON.stringify(cart));
                
                // Update UI
                displayCart();
                
                // Small alert for feedback
                alert(productName + ' has been added to your quote cart!');
            });
        });
    }

    // Remove item from cart (Global function so the inline onclick works)
    window.removeFromCart = function(index) {
        cart.splice(index, 1); // Remove 1 item at that index
        localStorage.setItem('sowetoCart', JSON.stringify(cart));
        displayCart();
    };

    // Clear entire cart
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            cart = [];
            localStorage.setItem('sowetoCart', JSON.stringify(cart));
            displayCart();
        });
    }

    // Initial display on page load
    displayCart();


    /*2. PRODUCT FILTER TABS LOGIC*/
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productRows = document.querySelectorAll('.item-row');

    if (filterButtons.length > 0 && productRows.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => {
                    btn.style.background = '#FFF';
                    btn.style.color = '#1A1A1A';
                });
                
                this.style.background = '#FF6B00';
                this.style.color = '#FFF';

                const filterValue = this.getAttribute('data-filter');

                productRows.forEach(row => {
                    if (filterValue === 'all' || row.getAttribute('data-category') === filterValue) {
                        row.style.display = 'block'; 
                    } else {
                        row.style.display = 'none'; 
                    }
                });
            });
        });
    }

    /*3. ENQUIRY FORM VALIDATION & AJAX SUBMISSION*/
    const enquiryForm = document.getElementById('enquiryForm');
    
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            let isValid = true;

            const showError = (input, message) => {
                const errorSpan = input.nextElementSibling;
                errorSpan.textContent = message;
                errorSpan.style.display = 'block';
                input.style.borderBottomColor = '#E74C3C';
                isValid = false;
            };

            const clearError = (input) => {
                const errorSpan = input.nextElementSibling;
                errorSpan.style.display = 'none';
                input.style.borderBottomColor = '#E5E5E5';
            };

            const name = document.getElementById('fullName');
            const phone = document.getElementById('phone');
            const email = document.getElementById('email');
            const type = document.getElementById('enquiryType');
            const message = document.getElementById('message');

            if (name.value.trim() === '') showError(name, 'Please enter your full name');
            else clearError(name);

            const phoneRegex = /^[0-9+\s()-]{10,15}$/;
            if (!phoneRegex.test(phone.value.trim())) showError(phone, 'Please enter a valid phone number');
            else clearError(phone);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email.value.trim() !== '' && !emailRegex.test(email.value.trim())) showError(email, 'Please enter a valid email address');
            else clearError(email);

            if (type.value === '') showError(type, 'Please select an enquiry type');
            else clearError(type);

            if (message.value.trim() === '') showError(message, 'Please enter your message');
            else clearError(message);

            if (isValid) {
                const submitBtn = enquiryForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                const formData = new FormData(enquiryForm);

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        enquiryForm.reset();
                        submitBtn.textContent = 'Submit Enquiry →';
                        submitBtn.disabled = false;
                        
                        // Clear the cart on successful submission
                        localStorage.removeItem('sowetoCart');

                        const successMsg = document.getElementById('formSuccess');
                        successMsg.innerHTML = '<strong>Success!</strong> Your enquiry has been sent directly to our team. We will get back to you within 24 hours.';
                        successMsg.style.display = 'block';
                        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        alert("Something went wrong. Please try again.");
                        submitBtn.textContent = 'Submit Enquiry →';
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    alert("Error sending message.");
                    submitBtn.textContent = 'Submit Enquiry →';
                    submitBtn.disabled = false;
                });
            }
        });
    }

    /*4. CONTACT FORM VALIDATION (Email Client)*/
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            const showError = (input, message) => {
                const errorSpan = input.nextElementSibling;
                errorSpan.textContent = message;
                errorSpan.style.display = 'block';
                input.style.borderBottomColor = '#E74C3C';
                isValid = false;
            };

            const clearError = (input) => {
                const errorSpan = input.nextElementSibling;
                errorSpan.style.display = 'none';
                input.style.borderBottomColor = '#E5E5E5';
            };

            const name = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const message = document.getElementById('contactMessage');

            if (name.value.trim() === '') showError(name, 'Please enter your name');
            else clearError(name);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) showError(email, 'Please enter a valid email address');
            else clearError(email);

            if (message.value.trim() === '') showError(message, 'Please enter your message');
            else clearError(message);

            if (isValid) {
                const recipient = 'soweto.cityelec@gmail.com'; 
                const subject = encodeURIComponent('Website Contact Form: ' + name.value);
                const body = encodeURIComponent('Name: ' + name.value + '\nEmail: ' + email.value + '\n\nMessage:\n' + message.value);
                
                window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
                contactForm.reset();
            }
        });
    }

});