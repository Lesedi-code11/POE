document.addEventListener('DOMContentLoaded', function() {

    /*1. SHOPPING CART and MODAL LOGIC*/
    const cartItemsContainer = document.getElementById('cartItems');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const clearCartBtn = document.getElementById('clearCartBtn');
    
    // Modal Variables
    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const modalProductName = document.getElementById('modalProductName');

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
                
                // Show Modal instead of alert
                if (cartModal) {
                    modalProductName.textContent = productName;
                    cartModal.style.display = 'flex';
                }
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

    // Close Modal Logic
    if (cartModal) {
        closeCartModal.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });

        continueShoppingBtn.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });

        window.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
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

    /*3. ENQUIRY FORM VALIDATION and AJAX SUBMISSION*/
    const enquiryForm = document.getElementById('enquiryForm');
    
    if (enquiryForm) {
        // AUTO-FILL MESSAGE IF CART HAS ITEMS
        let currentCart = JSON.parse(localStorage.getItem('sowetoCart')) || [];
        if (currentCart.length > 0) {
            const messageBox = document.getElementById('message');
            let cartText = "Hello, I would like a quote for the following items from my cart:\n\n";
            
            currentCart.forEach(item => {
                cartText += `- ${item.name} (R${item.price})\n`;
            });
            
            cartText += "\nPlease let me know the total price and availability.";
            messageBox.value = cartText;
        }

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

        /*5. CHECKOUT PAGE LOGIC*/
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutCartItems = document.getElementById('checkoutCartItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const orderDetailsInput = document.getElementById('orderDetailsInput');

    if (checkoutForm && checkoutCartItems) {
        let currentCart = JSON.parse(localStorage.getItem('sowetoCart')) || [];
        
        // If cart is empty, redirect back to products
        if (currentCart.length === 0) {
            window.location.href = 'products.html';
            return;
        }

        // Display the cart on the checkout page
        let total = 0;
        let orderTextForEmail = "NEW ORDER DETAILS:\n\n";

        checkoutCartItems.innerHTML = '';
        currentCart.forEach(item => {
            const li = document.createElement('li');
            li.style.padding = '10px 0';
            li.style.borderBottom = '1px solid #E5E5E5';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.innerHTML = `<span><strong>${item.name}</strong></span> <span>R${item.price}</span>`;
            checkoutCartItems.appendChild(li);
            
            total += parseFloat(item.price);
            orderTextForEmail += `- ${item.name} (R${item.price})\n`;
        });

        checkoutTotal.textContent = `Total: R${total}`;
        orderTextForEmail += `\nTOTAL ESTIMATE: R${total}`;

        // Put the cart text into the hidden input so Web3Forms emails it to you
        orderDetailsInput.value = orderTextForEmail;

        // Handle the checkout form submission
        checkoutForm.addEventListener('submit', function(e) {
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

            const name = document.getElementById('checkoutName');
            const phone = document.getElementById('checkoutPhone');
            const email = document.getElementById('checkoutEmail');
            const address = document.getElementById('checkoutAddress');

            if (name.value.trim() === '') showError(name, 'Please enter your name');
            else clearError(name);

            const phoneRegex = /^[0-9+\s()-]{10,15}$/;
            if (!phoneRegex.test(phone.value.trim())) showError(phone, 'Please enter a valid phone number');
            else clearError(phone);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) showError(email, 'Please enter a valid email address');
            else clearError(email);

            if (address.value.trim() === '') showError(address, 'Please enter your address');
            else clearError(address);

            if (isValid) {
                const submitBtn = checkoutForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Processing Order...';
                submitBtn.disabled = true;

                const formData = new FormData(checkoutForm);

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Clear the cart and hide the form
                        localStorage.removeItem('sowetoCart');
                        checkoutForm.style.display = 'none';
                        
                        const successMsg = document.getElementById('checkoutSuccess');
                        successMsg.style.display = 'block';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        alert("Something went wrong with your order. Please try again.");
                        submitBtn.textContent = 'Pay & Place Order';
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    alert("Error sending order.");
                    submitBtn.textContent = 'Pay & Place Order';
                    submitBtn.disabled = false;
                });
            }
        });
    }

        /*6. LIGHTBOX LOGIC*/
    const productImages = document.querySelectorAll('.product-img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.getElementById('closeLightbox');

    if (productImages.length > 0 && lightbox) {
        productImages.forEach(img => {
            img.addEventListener('click', function() {
                lightboxImg.src = this.src; // Get the clicked image source
                lightbox.style.display = 'flex'; // Show the lightbox
            });
        });

        // Close lightbox when clicking the X
        closeLightbox.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });

        // Close lightbox when clicking anywhere on the dark background
        lightbox.addEventListener('click', function(e) {
            if (e.target !== lightboxImg) {
                lightbox.style.display = 'none';
            }
        });
    }

});