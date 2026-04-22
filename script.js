// 1. DATA: Merge hardcoded items with LocalStorage items
const defaultProducts = [
    { id: 1, name: "Organic Red Tomatoes", category: "vegetables", price: 40, unit: "kg", img: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=400" },
    { id: 2, name: "Alphonso Mangoes", category: "fruits", price: 600, unit: "dozen", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" },
    { id: 3, name: "Premium Basmati Rice", category: "grains", price: 110, unit: "kg", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { id: 4, name: "Fresh Farm Milk", category: "dairy", price: 65, unit: "litre", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
    { id: 12, name: "Sweet Bananas", category: "fruits", price: 60, unit: "dozen", img: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400" }
];

// Combine standard data with Farmer-posted data
const farmerProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
// Map farmer data to match the format of default data
const mappedFarmerProducts = farmerProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: "kg", // default unit
    img: p.image,
    seller: p.farmerName || "Local Farmer"
}));

const allProducts = [...defaultProducts, ...mappedFarmerProducts];
let cart = JSON.parse(localStorage.getItem("activeCart")) || [];

// 2. INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    renderProducts(allProducts);
});

// 3. CORE FUNCTIONS
function renderProducts(items) {
    const grid = document.getElementById("product-grid") || document.getElementById("market-grid");
    if (!grid) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const isLoggedIn = !!user;
    const isCustomer = user?.role === 'customer';

    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}" style="width:100%; height:180px; object-fit:cover; border-radius:10px;">
            <div class="product-info" style="padding:15px;">
                <h3 style="margin:0; font-size:1.1rem;">${p.name}</h3>
                <p style="color:#666; font-size:0.8rem; text-transform:uppercase; margin:5px 0;">${p.category}</p>
                <p class="price" style="font-weight:bold; color:var(--primary); font-size:1.2rem;">₹${p.price} / ${p.unit || 'kg'}</p>
                
                ${isCustomer ? 
                    `<button onclick="addToCart(${p.id})" class="submit-btn" style="width:100%; padding:8px; font-size:0.9rem;">Add to Basket</button>` : 
                    isLoggedIn ? `<p style="font-size:0.7rem; color:#999;">Logged in as Farmer</p>` :
                    `<p style="font-size:0.7rem; color:#999;">Login to buy</p>`
                }
                ${p.seller ? `<p style="font-size:0.6rem; color:#aaa; margin-top:5px;">Sold by: ${p.seller}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function checkUserSession() {
    const user = JSON.parse(localStorage.getItem("user"));
    const sellLink = document.getElementById('sell-item-link');
    const aiDoctorLink = document.getElementById('ai-doctor-link');
    const authLink = document.getElementById('auth-link');
    const cartCont = document.getElementById('cart-container');

    if (user) {
        // 1. Change Login text to "Logout"
        if (authLink) {
            authLink.innerText = `Logout (${user.name})`;
            authLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem("user");
                localStorage.removeItem("activeCart");
                window.location.reload();
            };
        }

        // 2. UI change based on Role
        if (user.role === 'farmer') {
            if (sellLink) sellLink.classList.remove('hidden');
            if (aiDoctorLink) aiDoctorLink.classList.remove('hidden');
            if (cartCont) cartCont.classList.add('hidden'); // Farmers don't shop
        } else if (user.role === 'customer') {
            if (cartCont) cartCont.classList.remove('hidden'); // Show cart for buyers
            if (sellLink) sellLink.classList.add('hidden');
        }
    }
}

// 4. SEARCH & FILTER
function searchProducts() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered);
}

function filterCategory(cat, btn) {
    if(btn) {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat);
    renderProducts(filtered);
}

// 5. POST PRODUCT (Farmer Logic)
document.getElementById('post-product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        image: document.getElementById('prod-img').value,
        category: document.getElementById('prod-category').value,
        farmerName: user.name
    };

    let productsList = JSON.parse(localStorage.getItem("allProducts")) || [];
    productsList.push(newProduct);
    localStorage.setItem("allProducts", JSON.stringify(productsList));
    
    alert("Crop Listed!");
    window.location.href = "index.html";
});

// 6. AUTHENTICATION (Login/Signup)
document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Using explicit IDs so there is NO confusion
    const nameVal = document.getElementById('signup-name').value;
    const emailVal = document.getElementById('signup-email').value;
    const passVal = document.getElementById('signup-pass').value;
    const roleVal = document.getElementById('user-role').value;

    const newUser = {
        name: nameVal,
        email: emailVal,
        password: passVal,
        role: roleVal
    };

    // Save to "Database"
    let users = JSON.parse(localStorage.getItem("allUsers")) || [];
    
    // Check if email already exists
    if(users.some(u => u.email === emailVal)) {
        alert("This email is already registered!");
        return;
    }

    users.push(newUser);
    localStorage.setItem("allUsers", JSON.stringify(users));
    
    // Log them in immediately
    localStorage.setItem("user", JSON.stringify(newUser)); 
    
    alert(`Welcome to AGRIGO, ${nameVal}!`);
    window.location.href = "index.html";
});
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const pass = e.target[1].value;
    const users = JSON.parse(localStorage.getItem("allUsers")) || [];
    const foundUser = users.find(u => u.email === email && u.password === pass);

    if (foundUser) {
        localStorage.setItem("user", JSON.stringify(foundUser));
        window.location.href = "index.html";
    } else {
        alert("Invalid Login");
    }
});

// 7. CART LOGIC
function addToCart(id) {
    // Find item in allProducts (both default and farmer-posted)
    const item = allProducts.find(p => p.id == id);
    if(item) {
        cart.push(item);
        updateCartUI();
        alert(`${item.name} added to basket!`);
    }
}
function toggleAuth(type) {
    console.log("Switching to:", type);
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');

    if (type === 'signup') {
        // Show Signup, Hide Login
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        
        // Change tab colors
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    } else {
        // Show Login, Hide Signup
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        
        // Change tab colors
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    }
}

function updateCartUI() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    const countEl = document.getElementById("cart-count");
    
    let total = 0;
    
    container.innerHTML = cart.length === 0 ? 
        "<p style='text-align:center; color:#999; margin-top:50px;'>Your basket is empty.</p>" : 
        cart.map((item, index) => {
            total += parseInt(item.price);
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:#f9f9f9; padding:10px; border-radius:8px;">
                    <div>
                        <p style="margin:0; font-weight:bold; font-size:0.9rem;">${item.name}</p>
                        <p style="margin:0; color:var(--primary); font-size:0.8rem;">₹${item.price}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">🗑️</button>
                </div>
            `;
        }).join('');

    totalEl.innerText = total;
    if(countEl) countEl.innerText = cart.length;
    
    // Save to storage
    localStorage.setItem("activeCart", JSON.stringify(cart));
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    const overlay = document.getElementById("cart-overlay");

    // Toggle the 'active' class for the sliding effect
    modal.classList.toggle("active");

    // Show/Hide the blurred overlay
    if (modal.classList.contains("active")) {
        overlay.style.display = "block";
        updateCartUI(); // Refresh items whenever opened
    } else {
        overlay.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});
