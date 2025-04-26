// Check authentication status
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const authButtons = document.getElementById('authButtons');
    
    if (user) {
        // Check if user is admin and we're not already on admin page
        if (user.phone === "7989961692" && user.password === "sriram@123" && 
            !window.location.href.includes('frontend-admin')) {
            window.location.href = '../frontend-admin/admin.html';
            return;
        }
        // Hide auth buttons if user is logged in
        if (authButtons) {
            authButtons.style.display = 'none';
        }
    } else {
        // Show auth buttons if user is not logged in
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
    }
    return user;
}

// Load and display products
async function loadProducts() {
    const section = document.getElementById('productsSection');
    section.innerHTML = '<p style="text-align: center;">Loading products...</p>';
    
    try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();
        
        section.innerHTML = ''; // Clear loading message
        
        products.forEach(product => {
            const prodDiv = document.createElement('div');
            prodDiv.className = 'product-card';
            prodDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                <div class="price-action">
                    <span class="price">₹${product.price}</span>
                    <button onclick="addToCart('${product._id}', '${product.name}', '${product.image}', ${product.price})">
                        Add to Cart
                    </button>
                </div>
            `;
            section.appendChild(prodDiv);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        section.innerHTML = `
            <p style="text-align: center; color: #ff4b4b;">
                Failed to load products. Please try again later.
            </p>
        `;
    }
}

// Add product to cart
function addToCart(productId, name, image, price) {
    const user = checkAuth();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cartItems.push({ productId, name, image, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    showToast('Added to cart!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

// Add styles for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize page
window.onload = () => {
    checkAuth();
    loadProducts();
};
