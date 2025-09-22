// Inisialisasi Variabel Global
let cart = [];
let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
let selectedPaymentMethod = "Dana"; // Default

// Pengambilan Elemen DOM
const cartButton = document.getElementById("cart-button");
const cartDropdown = document.getElementById("cart-dropdown");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const cartCountElement = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");

const mobileCartButton = document.getElementById("mobile-cart-button");
const mobileCartSidebar = document.getElementById("mobile-cart-sidebar");
const mobileCartItemsContainer = document.getElementById("mobile-cart-items");
const mobileCartTotalElement = document.getElementById("mobile-cart-total");
const mobileCartCountElement = document.getElementById("mobile-cart-count");
const mobileCheckoutBtn = document.getElementById("mobile-checkout-btn");
const closeMobileCartBtn = document.getElementById("close-mobile-cart");

const paymentModal = document.getElementById("payment-modal");
const closePaymentModal = document.getElementsByClassName("close-payment")[0];
const confirmPaymentBtn = document.getElementById("confirm-payment");
const cancelPaymentBtn = document.getElementById("cancel-payment");

const checkoutModal = document.getElementById("checkout-modal");
const closeModal = document.getElementsByClassName("close")[0];
const printBillBtn = document.getElementById("print-bill");

const closeBillBtn = document.getElementById("close-bill");
const billItemsContainer = document.getElementById("bill-items");
const billSummaryContainer = document.getElementById("bill-summary");
const billDateElement = document.getElementById("bill-date");

const orderHistoryContainer = document.getElementById("order-history");
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

// Event Listener saat DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  updateCart();
  updateOrderHistory();
});

// Alihkan Keranjang Dropdown Desktop
cartButton.addEventListener("click", (e) => {
  e.stopPropagation();
  cartDropdown.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (!cartButton.contains(e.target) && !cartDropdown.contains(e.target)) {
    cartDropdown.classList.remove("open");
  }
});

// Alihkan Sidebar Keranjang Seluler
mobileCartButton?.addEventListener("click", () => {
  mobileCartSidebar.classList.remove("translate-x-full");
});
closeMobileCartBtn?.addEventListener("click", () => {
  mobileCartSidebar.classList.add("translate-x-full");
});

// Metode Pembayaran
checkoutBtn.addEventListener("click", showPaymentModal);
mobileCheckoutBtn.addEventListener("click", showPaymentModal);
closePaymentModal?.addEventListener("click", () => (paymentModal.style.display = "none"));
cancelPaymentBtn?.addEventListener("click", () => (paymentModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === paymentModal) paymentModal.style.display = "none";
});
confirmPaymentBtn.addEventListener("click", () => {
  paymentModal.style.display = "none";
  completeOrder();
});

// Pembayaran Modal (Struk Bill)
closeModal?.addEventListener("click", () => (checkoutModal.style.display = "none"));
closeBillBtn?.addEventListener("click", () => (checkoutModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === checkoutModal) checkoutModal.style.display = "none";
});
printBillBtn?.addEventListener("click", printBill);

// Pemilihan Metode Pembayaran
document.querySelectorAll('input[name="payment"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    selectedPaymentMethod = radio.value;
  });
});

// Alihkan Menu Navigasi Seluler
mobileMenuButton?.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});

// Fungsi Tambah ke Keranjang
function addToCart(name, price, image) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  updateCart();
  showNotification(`${name} telah ditambahkan ke keranjang`);
}

// Fitur Pembaruan Keranjang & UI
function updateCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountElement.textContent = itemCount;
  mobileCartCountElement.textContent = itemCount;

  updateCartUI(cartItemsContainer, checkoutBtn);
  updateCartUI(mobileCartItemsContainer, mobileCheckoutBtn, true);
}

function updateCartUI(container, checkoutButton, isMobile = false) {
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">Keranjang kosong</p>';
    checkoutButton.disabled = true;
    if (isMobile) mobileCartTotalElement.textContent = "Rp 0";
    else cartTotalElement.textContent = "Rp 0";
    return;
  }

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemElement = document.createElement("div");
    itemElement.className = "flex items-center justify-between mb-3 pb-3 border-b";
    itemElement.innerHTML = `
      <div class="flex items-center">
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-md object-cover mr-3">
        <div>
          <h4 class="font-medium">${item.name}</h4>
          <p class="text-sm text-gray-600">Rp ${item.price.toLocaleString()}</p>
        </div>
      </div>
      <div class="flex items-center">
        <button onclick="changeQuantity(${index}, -1)" class="text-gray-500 hover:text-primary px-2">
          <i class="fas fa-minus text-xs"></i>
        </button>
        <span class="mx-2">${item.quantity}</span>
        <button onclick="changeQuantity(${index}, 1)" class="text-gray-500 hover:text-primary px-2">
          <i class="fas fa-plus text-xs"></i>
        </button>
        <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700 ml-3">
          <i class="fas fa-trash"></i>
        </button>
      </div>`;
    container.appendChild(itemElement);
  });

  if (isMobile) {
    mobileCartTotalElement.textContent = `Rp ${total.toLocaleString()}`;
  } else {
    cartTotalElement.textContent = `Rp ${total.toLocaleString()}`;
  }
  checkoutButton.disabled = false;
}

// Fungsi Ubah & Hapus Barang
function changeQuantity(index, change) {
  const newQuantity = cart[index].quantity + change;
  if (newQuantity < 1) removeItem(index);
  else {
    cart[index].quantity = newQuantity;
    updateCart();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Tampilkan Modal Pembayaran
function showPaymentModal() {
  if (cart.length === 0) return;
  cartDropdown.classList.remove("open");
  mobileCartSidebar.classList.add("translate-x-full");
  paymentModal.style.display = "block";
}

// Tampilkan Struk Pembayaran
function showCheckoutModal() {
  if (cart.length === 0) return;

  billItemsContainer.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    billItemsContainer.innerHTML += `
      <div class="bill-item">
        <span>${item.name} (${item.quantity}x)</span>
        <span>Rp ${itemTotal.toLocaleString()}</span>
      </div>`;
  });

  billSummaryContainer.innerHTML = `
    <div class="bill-item"><span>Subtotal</span><span>Rp ${subtotal.toLocaleString()}</span></div>
    <div class="bill-total bill-item"><span>Total</span><span>Rp ${subtotal.toLocaleString()}</span></div>`;

  billDateElement.textContent = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  checkoutModal.style.display = "block";
}

// Fungsi Selesaikan Pesanan
function completeOrder() {
  if (cart.length === 0) return;
  const now = new Date();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id: now.getTime(),
    date: now.toISOString(),
    items: [...cart],
    subtotal,
    total: subtotal,
    paymentMethod: selectedPaymentMethod,
  };

  orderHistory.unshift(order);
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
  cart = [];
  updateCart();
  updateOrderHistory();
  paymentModal.style.display = "none";
  viewBill(order.id);
  showNotification("Pesanan berhasil diproses!");
}

function updateOrderHistory() {
  if (orderHistory.length === 0) {
    orderHistoryContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada riwayat pesanan</p>';
    return;
  }

  orderHistoryContainer.innerHTML = "";
  orderHistory.forEach((order) => {
    const date = new Date(order.date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const itemsHTML = order.items
      .map(
        (item) => `
      <div class="flex justify-between mb-1">
        <span>${item.name} (${item.quantity}x)</span>
        <span>Rp ${(item.price * item.quantity).toLocaleString()}</span>
      </div>`
      )
      .join("");

    orderHistoryContainer.innerHTML += `
      <div class="history-item">
        <div class="history-item-header">
          <div>
            <h4 class="font-bold">Order #${order.id.toString().slice(-6)}</h4>
            <p class="text-sm text-gray-600">${date}</p>
          </div>
        </div>
        <div class="mb-3">${itemsHTML}</div>
        <div class="flex justify-between border-t pt-2 text-sm">
          <div><span class="text-gray-600">Total:</span></div>
          <div><span class="font-bold text-primary">Rp ${order.total.toLocaleString()}</span></div>
        </div>
        <div class="history-item-actions">
          <button onclick="reorder(${order.id})" class="text-primary hover:text-secondary"><i class="fas fa-redo mr-1"></i> Pesan Lagi</button>
          <button onclick="viewBill(${order.id})" class="text-blue-500 hover:text-blue-700"><i class="fas fa-file-invoice mr-1"></i> Lihat Bill</button>
        </div>
      </div>`;
  });
}

// Fungsi Pesan Ulang & Lihat Tagihan
function reorder(orderId) {
  const order = orderHistory.find((o) => o.id === orderId);
  if (!order) return;
  cart = [...order.items];
  updateCart();
  showNotification("Item telah ditambahkan ke keranjang");
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}

function viewBill(orderId) {
  const order = orderHistory.find((o) => o.id === orderId);
  if (!order) return;

  billItemsContainer.innerHTML = order.items
    .map(
      (item) => `
    <div class="bill-item"><span>${item.name} (${item.quantity}x)</span><span>Rp ${(item.price * item.quantity).toLocaleString()}</span></div>`
    )
    .join("");

  billSummaryContainer.innerHTML = `
    <div class="bill-total bill-item"><span>Total</span><span>Rp ${order.total.toLocaleString()}</span></div>
    ${
      order.paymentMethod === "Dana"
        ? `
      <div class="bill-item text-sm"><span>Transfer ke:</span><span>Dana - 0877-7667-1314 (PangsitKu)</span></div>`
        : ""
    }
    ${
      order.paymentMethod === "SeaBank"
        ? `
      <div class="bill-item text-sm"><span>Transfer ke:</span><span>SeaBank - 9012-3456-7890 (PangsitKu)</span></div>`
        : ""
    }`;

  billDateElement.textContent = new Date(order.date).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  checkoutModal.style.display = "block";
}

// Pemberitahuan Pop-up
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in";
  notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i><span>${message}</span>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.remove("animate-fade-in");
    notification.classList.add("animate-fade-out");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Cetak Tagihan sebagai PDF
function printBill() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const billContent = document.getElementById("bill-content").innerText;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(billContent, 180);
  doc.text(lines, 10, 10);
  doc.save(`Struk_PangsitKu_${new Date().getTime()}.pdf`);

  completeOrder();
}

// Pengalihan ke WhatsApp
function redirectToWhatsApp() {
  const phone = "6287776671314";
  const items = cart
    .map(
      (item) =>
        `${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`
    )
    .join("%0A");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `Halo PangsitKu, saya ingin memesan:%0A%0A${items}%0A%0ATotal: Rp ${total.toLocaleString()}%0A%0AMohon info cara pembayaran dan pengirimannya. Terima kasih!`;
  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
}