// frontend-admin/admin.js

// Check authentication on page load
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || user.phone !== "7989961692" || user.password !== "sriram@123") {
        window.location.href = '../frontend-user/login.html';
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../frontend-user/login.html';
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');

    // Load content based on tab
    switch(tabName) {
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

function showAddProductForm() {
    document.getElementById('addProductModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        const product = await response.json();
        
        // Create edit modal if it doesn't exist
        let editModal = document.getElementById('editProductModal');
        if (!editModal) {
            editModal = document.createElement('div');
            editModal.id = 'editProductModal';
            editModal.className = 'modal';
            editModal.innerHTML = `
                <div class="modal-content">
                    <h2>Edit Product</h2>
                    <form id="editProductForm">
                        <input type="text" name="name" placeholder="Product Name" required>
                        <input type="number" name="price" placeholder="Price" required>
                        <textarea name="description" placeholder="Description" required></textarea>
                        <input type="text" name="image" placeholder="Image URL" required>
                        <input type="hidden" name="productId">
                        <div class="modal-actions">
                            <button type="button" onclick="closeModal('editProductModal')" class="cancel-btn">Cancel</button>
                            <button type="submit">Update Product</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(editModal);
            
            // Add submit handler
            document.getElementById('editProductForm').addEventListener('submit', handleEditProduct);
        }
        
        // Fill form with product data
        const form = document.getElementById('editProductForm');
        form.name.value = product.name;
        form.price.value = product.price;
        form.description.value = product.description;
        form.image.value = product.image;
        form.productId.value = productId;
        
        // Show modal
        editModal.classList.add('active');
    } catch (error) {
        alert('Failed to load product details');
    }
}

// Handle edit product form submission
async function handleEditProduct(e) {
    e.preventDefault();
    const formData = {
        name: e.target.name.value,
        price: Number(e.target.price.value),
        description: e.target.description.value,
        image: e.target.image.value
    };
    const productId = e.target.productId.value;

    try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product');
        }

        const updatedProduct = await response.json();
        closeModal('editProductModal');
        loadProducts();
        alert('Product updated successfully');
    } catch (error) {
        alert(error.message || 'Failed to update product');
    }
}

// Delete product function
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProducts();
            alert('Product deleted successfully');
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        alert('Failed to delete product');
    }
}

async function loadProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '<p>Loading products...</p>';
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();
        
        productsList.innerHTML = products.map(product => `
            <div class="item-card">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <strong>${product.name}</strong>
                        <p>₹${product.price}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editProduct('${product._id}')">Edit</button>
                    <button onclick="deleteProduct('${product._id}')" class="cancel-btn">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        productsList.innerHTML = '<p>Failed to load products</p>';
    }
}

async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '<p>Loading orders...</p>';
    try {
        const response = await fetch('http://localhost:5000/api/admin/orders');
        const orders = await response.json();
        
        ordersList.innerHTML = orders.map(order => `
            <div class="item-card">
                <div>
                    <strong>Order #${order._id}</strong>
                    <p>Total: ₹${order.totalAmount}</p>
                    <p>Status: ${order.status || 'Placed'}</p>
                    <p>Payment: ${order.paymentMethod} (${order.paymentStatus})</p>
                    <p>Customer: ${order.address ? order.address.name : 'N/A'}</p>
                    <p>Phone: ${order.address ? order.address.phone : 'N/A'}</p>
                </div>
                <div>
                    <select onchange="updateOrderStatus('${order._id}', this.value)">
                        <option value="Placed" ${!order.status || order.status === 'Placed' ? 'selected' : ''}>Placed</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
        `).join('');
    } catch (error) {
        ordersList.innerHTML = '<p>Failed to load orders</p>';
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert('Order status updated successfully');
        } else {
            alert('Failed to update order status');
            loadOrders(); // Reload to reset the select
        }
    } catch (error) {
        alert('Failed to update order status');
        loadOrders(); // Reload to reset the select
    }
}

async function loadUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<p>Loading users...</p>';
    try {
        const response = await fetch('http://localhost:5000/api/admin/users');
        const users = await response.json();
        
        usersList.innerHTML = users.map(user => `
            <div class="item-card">
                <div>
                    <strong>${user.name || 'No Name'}</strong>
                    <p>Phone: ${user.phone}</p>
                    <p>Email: ${user.email || 'N/A'}</p>
                    <p>Orders: ${user.orders ? user.orders.length : 0}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        usersList.innerHTML = '<p>Failed to load users</p>';
    }
}

// Add Product Form Submission
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: e.target.name.value,
        price: Number(e.target.price.value),
        description: e.target.description.value,
        image: e.target.image.value
    };

    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeModal('addProductModal');
            loadProducts();
            e.target.reset();
        } else {
            alert('Failed to add product');
        }
    } catch (error) {
        alert('Failed to add product');
    }
});

// Initialize page
window.onload = () => {
    checkAuth();
    showTab('products');
};
