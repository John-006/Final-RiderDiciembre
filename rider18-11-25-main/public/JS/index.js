let cart = [];

document.addEventListener('DOMContentLoaded', function () {
    loadCartFromLocalStorage();
    
    fetch('http://localhost:3000/getAll')
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']));
});

const addBtn = document.querySelector('#add-btn');

addBtn.onclick = function () {
    const name = document.querySelector('#name-input').value;
    const price = document.querySelector('#price-input').value;
    const stock = document.querySelector('#stock-input').value;

    if(name && price && stock) {
        document.querySelector('#name-input').value = ""; 
        document.querySelector('#price-input').value = ""; 
        document.querySelector('#stock-input').value = "";

        fetch('http://localhost:3000/insert', {
            headers: { 'Content-type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ name: name, price: price, stock: stock })
        })
        .then(response => response.json())
        .then(data => location.reload()); 
    } else {
        alert("Por favor llena todos los campos del producto.");
    }
}

const importJsonBtn = document.querySelector('#import-json-btn');
const jsonUrlInput = document.querySelector('#json-url-input');
const importMessage = document.querySelector('#import-message');

importJsonBtn.onclick = function() {
    const url = jsonUrlInput.value;
    
    if (!url) {
        importMessage.textContent = "Por favor, ingresa una URL.";
        importMessage.style.color = "red";
        return;
    }

    importMessage.textContent = "Importando, por favor espera...";
    importMessage.style.color = "orange";
    
    fetch('http://localhost:3000/import-json', {
        headers: { 'Content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            importMessage.textContent = data.message;
            importMessage.style.color = "green";
            setTimeout(() => { location.reload(); }, 1000); 
        } else {
            importMessage.textContent = `Error: ${data.message}`;
            importMessage.style.color = "red";
        }
    })
    .catch(error => {
        importMessage.textContent = `Error de red o conexión.`;
        importMessage.style.color = "red";
    });
};


document.querySelector('table tbody').addEventListener('click', function(event) {
    const id = event.target.dataset.id;
    const name = event.target.dataset.name;
    const price = event.target.dataset.price;

    if (event.target.className === "delete-row-btn") {
        deleteRowById(id);
    } else if (event.target.className === "edit-row-btn") {
        handleEdit(id);
    } else if (event.target.className === "add-cart-btn") {
        addToCart(id, name, price);
    }
});

function deleteRowById(id) {
    if(confirm("¿Seguro que quieres eliminar este producto?")) {
        fetch('http://localhost:3000/delete/' + id, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) location.reload();
        });
    }
}

function handleEdit(id) {
    const section = document.querySelector('#edit-section');
    section.hidden = false;
    document.querySelector('#update-id').value = id;
    section.scrollIntoView({behavior: "smooth"});
}

const updateBtn = document.querySelector('#update-btn');

updateBtn.onclick = function() {
    const updateId = document.querySelector('#update-id').value;
    const updateName = document.querySelector('#update-name').value;
    const updatePrice = document.querySelector('#update-price').value;
    const updateStock = document.querySelector('#update-stock').value;

    fetch('http://localhost:3000/update', {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ id: updateId, name: updateName, price: updatePrice, stock: updateStock })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) location.reload();
    });
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    let tableHtml = "";

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='6'>No hay productos</td></tr>";
        return;
    }

    data.forEach(function ({id, name, price, stock, date_added}) {
        const dateObj = new Date(date_added);
        const fechaLegible = dateObj.toLocaleString(); 

        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>$${price}</td>`;
        tableHtml += `<td>${stock}</td>`;
        tableHtml += `<td>${fechaLegible}</td>`;
        tableHtml += `<td>
            <button class="add-cart-btn" data-id="${id}" data-name="${name}" data-price="${price}">🛒</button>
            <button class="edit-row-btn" data-id="${id}">✏️</button>
            <button class="delete-row-btn" data-id="${id}">🗑️</button>
        </td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}


function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('supermarket_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    renderCart();
}

function saveCartToLocalStorage() {
    localStorage.setItem('supermarket_cart', JSON.stringify(cart));
}

function addToCart(id, name, price) {
    const existingItemIndex = cart.findIndex(item => item.id == id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ id: id, name: name, price: parseFloat(price), quantity: 1 });
    }

    saveCartToLocalStorage();
    renderCart();
}

function renderCart() {
    const cartItemsContainer = document.querySelector('#cart-items');
    const cartTotalSpan = document.querySelector('#cart-total');
    const cartCountSpan = document.querySelector('#cart-count');
    const emptyMessage = document.querySelector('#cart-empty-message');
    const checkoutBtn = document.querySelector('#checkout-btn');
    const clearCartBtn = document.querySelector('#clear-cart-btn');
    
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        cartCountSpan.textContent = '0';
        checkoutBtn.disabled = true;
        clearCartBtn.disabled = true;
        cartTotalSpan.textContent = '0.00';
        return;
    }
    
    emptyMessage.style.display = 'none';
    cartCountSpan.textContent = cart.length;
    checkoutBtn.disabled = false;
    clearCartBtn.disabled = false;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            ${item.name} ($${item.price.toFixed(2)}) x ${item.quantity} = **$${itemTotal.toFixed(2)}**
            <button class="remove-cart-btn btn-danger" data-index="${index}">-</button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotalSpan.textContent = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToLocalStorage();
    renderCart();
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-cart-btn')) {
        const index = event.target.dataset.index;
        removeFromCart(index);
    }
});

document.querySelector('#clear-cart-btn').onclick = function() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCartToLocalStorage();
        renderCart();
    }
};


document.querySelector('#checkout-btn').onclick = function() {
    alert(`Gracias por tu compra. Total a pagar: $${document.querySelector('#cart-total').textContent}`);
    cart = [];
    saveCartToLocalStorage();
    renderCart();
};