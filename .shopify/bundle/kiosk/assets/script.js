window.addEventListener('DOMContentLoaded', () => {
    console.log('Extension loaded successfully');
    const UrlParams = new URLSearchParams(window.location.search);
    const RefreanceId = UrlParams.get('referenceKey');
    console.log('referenc', RefreanceId);
  
    // Store referenceKey in local storage if it exists
    if (RefreanceId) {
        localStorage.setItem('referenceKey', RefreanceId);
    }
  
    // Check if referenceKey is present in local storage
    const storedReferenceKey = localStorage.getItem('referenceKey');
    if (storedReferenceKey) {
        // Modal and close button references
        const modal = document.getElementById('kioskModal');
        const closeModalButton = document.getElementById('closeModal');
        let currency;
        let TotalPrice;
  
        // Function to show the modal
        const showModal = async (event) => {
            event.preventDefault();
            const Cartapi = await fetch('/cart.js', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const CartData = await Cartapi.json();
            console.log('CartData', CartData);
  
            const cartToken = CartData.token.split("?")[0];
            TotalPrice = CartData.original_total_price / 100;
            currency = CartData.currency;
  
            console.log('Token', cartToken);
            console.log('TotalPrice', TotalPrice);
            console.log('Currency', currency);
  
            const SiteUrl = window.location.href;
            const baseUrl = SiteUrl.split('.com')[0] + '.com';
            const sanitizedCartToken = cartToken.replace(/"/g, '');
            const returnUrl = `${baseUrl}/checkouts/cn/${sanitizedCartToken}`;
            console.log('return', returnUrl);
  
            modal.classList.add('modal');
            modal.classList.remove('hidemodal');
  
            // Automatically close the modal after 10 seconds
            setTimeout(async () => {
                hideModal();
                console.log('hiting clear api')
                const Cartapi = await fetch('/cart/clear.js', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                console.log('CartClear', Cartapi)
                console.log('modal close successfullyywee')
                // window.location.reload()
                window.location.href=`/?referenceKey=${storedReferenceKey}`
                
            }, 5000);
  
            // Load QR Code library dynamically and show the QR code
            loadQRCodeLibrary(() => {
                displayQRCode(returnUrl); // Replace with your actual URL
            });
        };
  
        // Function to hide the modal
        const hideModal = () => {
            modal.classList.remove('modal');
            modal.classList.add('hidemodal');
        };
  
        // Function to load the QR Code library
        const loadQRCodeLibrary = (callback) => {
            if (!window.QRCode) { // Check if the library is already loaded
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
                script.onload = callback;
                document.head.appendChild(script);
            } else {
                callback();
            }
        };
  
        // Function to display the QR code
        const displayQRCode = (url) => {
            const modalContent = document.querySelector('.modal-content');
            modalContent.innerHTML = ''; // Clear previous content
  
            // Add the close button
            const closeButton = document.createElement('button');
            closeButton.classList.add('close-button');
            closeButton.id = 'closeModal';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', hideModal);
            modalContent.appendChild(closeButton);
  
            // Add the title
            const title = document.createElement('h1');
            title.textContent = 'PAY SECURELY';
            title.classList.add('payTitle');
            modalContent.appendChild(title);
  
            // Add the total price message
            const totalPrice = document.createElement('h4');
            totalPrice.textContent = `Total: ${TotalPrice} ${currency}`;
            totalPrice.classList.add('totalPrice');
            modalContent.appendChild(totalPrice);
  
            // Add the QR code container
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qrcode';
            modalContent.appendChild(qrDiv);
  
            // Generate the QR code
            new QRCode(qrDiv, {
                text: url, // URL for the QR code
                width: 250,
                height: 250,
            });
  
            // Add the "Scan to pay by phone" message after the QR code
            const scanMessage = document.createElement('h4');
            scanMessage.textContent = 'Scan to pay by phone';
            scanMessage.classList.add('scanMessage');
            modalContent.appendChild(scanMessage);
        };
  
        // Attach event listeners to checkout buttons
        const attachClickListener = (button) => {
            if (button) {
                button.addEventListener('click', showModal);
            }
        };
  
        // Target checkout button by ID
        const checkoutButton = document.getElementById('CartDrawer-Checkout');
        attachClickListener(checkoutButton);
  
        // Target all buttons with the class `cart__checkout-button`
        const checkoutButtons = document.querySelectorAll('.cart__checkout-button');
        checkoutButtons.forEach(attachClickListener);
  
        // Event listener to close the modal when close button is clicked
        closeModalButton.addEventListener('click', hideModal);
  
        // Optional: MutationObserver to handle dynamically loaded buttons
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                const updatedButton = document.getElementById('CartDrawer-Checkout');
                if (updatedButton) {
                    attachClickListener(updatedButton);
                }
            });
        });
  
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        console.log('No referenceKey in local storage, skipping modal logic.');
    }
  });
  