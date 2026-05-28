import { useState, useEffect } from "react";

// ─── LOCALSTORAGE KEYS ──────────────────────────────────────────────────────
const STORAGE_KEYS = {
  STOCK: "softcare_stock",
  SALES: "softcare_sales",
  REMINDERS: "softcare_reminders",
};

// ─── DEMO DATA (only used if localStorage is empty) ─────────────────────────
const DEMO_STOCK = [
  { id: 1, name: "iPhone 13 Screen", category: "Parts", price: 4500, quantity: 8 },
  { id: 2, name: "Samsung S21 Battery", category: "Parts", price: 1800, quantity: 15 },
  { id: 3, name: "Charging Port (Type-C)", category: "Parts", price: 650, quantity: 30 },
  { id: 4, name: "Screen Repair - iPhone", category: "Service", price: 3500, quantity: 99 },
  { id: 5, name: "Screen Repair - Samsung", category: "Service", price: 2800, quantity: 99 },
  { id: 6, name: "Battery Replacement", category: "Service", price: 1200, quantity: 99 },
  { id: 7, name: "Water Damage Repair", category: "Service", price: 2000, quantity: 99 },
  { id: 8, name: "Tempered Glass", category: "Accessories", price: 350, quantity: 50 },
];
const DEMO_SALES = [
  { id: 1, items: JSON.stringify([{ name: "Screen Repair - iPhone", qty: 1, price: 3500 }]), total: 3500, customer: "John Kamau", payment: "Mpesa", phone: "0712345678", date: new Date(Date.now() - 172800000).toISOString() },
  { id: 2, items: JSON.stringify([{ name: "Battery Replacement", qty: 1, price: 1200 }, { name: "Tempered Glass", qty: 1, price: 350 }]), total: 1550, customer: "Mary Wanjiku", payment: "Cash", phone: "0722987654", date: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, items: JSON.stringify([{ name: "Samsung S21 Battery", qty: 2, price: 1800 }]), total: 3600, customer: "Walk-in", payment: "Cash", phone: "", date: new Date().toISOString() },
];
const DEMO_REMINDERS = [
  { id: 1, text: "Order iPhone 15 screens", due: new Date().toISOString().split("T")[0], done: false },
  { id: 2, text: "Follow up with John on repair", due: new Date().toISOString().split("T")[0], done: false },
];

// Helper to load from localStorage or fallback to demo
const loadFromStorage = (key, demoData) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return demoData;
    }
  }
  return demoData;
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  pos: "M3 3h18v4H3zM3 9h18v12H3zM9 13h6M9 17h4",
  orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  invoices: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  reports: "M18 20V10M12 20V4M6 20v-6",
  receipts: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 12l2 2 4-4",
  stock: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  reminders: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  x: "M18 6L6 18M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  menu: "M3 12h18M3 6h18M3 18h18",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  print: "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z",
  whatsapp: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  check: "M20 6L9 17l-5-5",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  pdf: "M4 4v16h16V4H4zm2 2h12v12H6V6zm2 2v8h8V8H8z",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => `Ksh ${Number(n).toLocaleString()}`;
const today = () => new Date().toISOString().split("T")[0];
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const fmtPhone = (p) => {
  if (!p) return "";
  let n = p.replace(/\D/g, "");
  if (n.startsWith("0")) n = "254" + n.slice(1);
  if (!n.startsWith("254")) n = "254" + n;
  return n;
};

// ─── PROFESSIONAL PRINT RECEIPT (with VAT, QR, barcode) ─────────────────────
const printReceipt = (sale) => {
  const items = JSON.parse(sale.items);
  const receiptNum = "RC" + String(sale.id).slice(-6).toUpperCase();
  const cashier = "Softcare User";
  const subTotal = sale.total;
  const vat = subTotal * 0.16;
  const total = subTotal + vat;

  const w = window.open("", "_blank", "width=450,height=700");
  w.document.write(`<!DOCTYPE html>
  <html>
  <head>
    <title>Receipt ${receiptNum}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 20px 15px;
        max-width: 350px;
        margin: 0 auto;
        background: white;
        color: black;
      }
      .receipt {
        border: 1px solid #ccc;
        padding: 12px;
        border-radius: 4px;
      }
      .header {
        text-align: center;
        margin-bottom: 15px;
        border-bottom: 1px dashed #333;
        padding-bottom: 10px;
      }
      .header h2 {
        font-size: 18px;
        letter-spacing: 2px;
        margin-bottom: 5px;
      }
      .header p {
        font-size: 10px;
        color: #555;
        margin: 2px 0;
      }
      .divider {
        border-top: 1px dashed #333;
        margin: 8px 0;
      }
      .row {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }
      .items-table {
        width: 100%;
        margin: 10px 0;
        border-collapse: collapse;
      }
      .items-table th, .items-table td {
        padding: 4px 0;
        text-align: left;
      }
      .items-table th {
        border-bottom: 1px dotted #888;
        font-size: 10px;
        text-transform: uppercase;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 14px;
        margin-top: 8px;
        padding-top: 6px;
        border-top: 2px solid #000;
      }
      .text-center { text-align: center; }
      .small { font-size: 9px; color: #555; }
      .barcode {
        letter-spacing: 3px;
        font-size: 10px;
        text-align: center;
        margin: 12px 0;
        font-family: monospace;
      }
      .qr {
        text-align: center;
        margin: 10px 0;
        font-size: 10px;
      }
      .footer {
        text-align: center;
        margin-top: 15px;
        font-size: 9px;
        color: #777;
      }
      @media print {
        body { margin: 0; padding: 0; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <h2>SOFTCARE SOLUTIONS</h2>
        <p>Nairobi CBD · +254 700 123 456</p>
        <p>softcaremobilesolution@gmail.com</p>
        <p>PIN: P051234567Z</p>
      </div>

      <div class="row"><span>Receipt No:</span><strong>${receiptNum}</strong></div>
      <div class="row"><span>Date:</span><span>${new Date(sale.date).toLocaleString("en-KE")}</span></div>
      <div class="row"><span>Cashier:</span><span>${cashier}</span></div>
      <div class="row"><span>Customer:</span><strong>${sale.customer}</strong></div>
      <div class="row"><span>Payment:</span><span>${sale.payment}</span></div>
      ${sale.phone ? `<div class="row"><span>Phone:</span><span>${sale.phone}</span></div>` : ''}

      <div class="divider"></div>

      <table class="items-table">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${items.map(it => `
            <tr>
              <td>${it.name}</td>
              <td style="text-align:center">${it.qty}</td>
              <td style="text-align:right">${fmt(it.price)}</td>
              <td style="text-align:right">${fmt(it.price * it.qty)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="divider"></div>

      <div class="row"><span>Subtotal:</span><span>${fmt(subTotal)}</span></div>
      <div class="row"><span>VAT (16%):</span><span>${fmt(vat)}</span></div>
      <div class="total-row">
        <span>TOTAL</span>
        <span>${fmt(total)}</span>
      </div>
      
      <div class="row"><span>Amount Paid:</span><span>${fmt(total)}</span></div>
      <div class="row"><span>Change:</span><span>Ksh 0.00</span></div>

      <div class="divider"></div>

      <div class="qr">
        ⬛⬛⬛⬛⬛⬛⬛⬛⬛<br>
        ⬛  SCAN ME  ⬛<br>
        ⬛⬛⬛⬛⬛⬛⬛⬛⬛
      </div>

      <div class="barcode">| | | | | | | | | | | |</div>

      <div class="footer">
        Thank you for choosing Softcare!<br>
        Goods once sold cannot be exchanged or returned.<br>
        Visit us again 😊
      </div>
    </div>

    <script>
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 800);
      }, 200);
    <\/script>
  </body>
  </html>`);
  w.document.close();
};

// ─── WHATSAPP RECEIPT ───────────────────────────────────────────────────────
const sendWhatsApp = (sale) => {
  if (!sale.phone || sale.phone.trim() === "") {
    alert("No phone number for this customer. Please add a phone number to send WhatsApp receipt.");
    return;
  }
  const items = JSON.parse(sale.items);
  const receiptNum = "RC" + String(sale.id).slice(-6).toUpperCase();
  const lines = items.map(it => `  • ${it.name} ×${it.qty}: Ksh ${(it.price * it.qty).toLocaleString()}`).join("\n");
  const msg = `*SOFTCARE SOLUTIONS* 🔧\nNairobi CBD | +254 700 123 456\n━━━━━━━━━━━━━━━━\n*Receipt ${receiptNum}*\nDate: ${new Date(sale.date).toLocaleString("en-KE")}\nCustomer: *${sale.customer}*\nPayment: ${sale.payment}\n━━━━━━━━━━━━━━━━\n${lines}\n━━━━━━━━━━━━━━━━\n*TOTAL: Ksh ${Number(sale.total).toLocaleString()}*\n\nThank you for choosing Softcare! We appreciate your business 🙏`;
  const phone = fmtPhone(sale.phone);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
};

// ─── RECEIPT CARD (with PDF button) ─────────────────────────────────────────
function ReceiptCard({ sale, onClose }) {
  const items = JSON.parse(sale.items);
  const receiptNum = "RC" + String(sale.id).slice(-6).toUpperCase();
  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, width: "100%", maxWidth: 380, fontFamily: "monospace" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#f1f5f9" }}>SOFTCARE SOLUTIONS</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>Nairobi CBD · +254 700 123 456</div>
        <div style={{ borderBottom: "2px dashed #334155", margin: "12px 0" }} />
      </div>
      <div style={{ fontSize: 12, marginBottom: 10, color: "#cbd5e1", lineHeight: 1.8 }}>
        <div>Receipt: <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{receiptNum}</span></div>
        <div>Date: {new Date(sale.date).toLocaleString("en-KE")}</div>
        <div>Customer: <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{sale.customer}</span></div>
        <div>Payment: {sale.payment}</div>
      </div>
      <div style={{ borderBottom: "1px dashed #334155", margin: "8px 0" }} />
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5, color: "#e2e8f0" }}>
          <span>{it.name} ×{it.qty}</span>
          <span style={{ fontWeight: 600 }}>Ksh {(it.price * it.qty).toLocaleString()}</span>
        </div>
      ))}
      <div style={{ borderTop: "2px dashed #334155", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, color: "#f1f5f9" }}>
        <span>TOTAL</span><span style={{ color: "#4ade80" }}>Ksh {Number(sale.total).toLocaleString()}</span>
      </div>
      <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#475569" }}>Thank you for choosing Softcare!</div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {onClose && <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Close</button>}
        <button onClick={() => printReceipt(sale)} style={{ flex: 1.2, padding: "9px 0", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon d={Icons.print} size={15} /> Print
        </button>
        <button onClick={() => printReceipt(sale)} style={{ flex: 1.2, padding: "9px 0", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon d={Icons.pdf} size={15} /> PDF
        </button>
        <button onClick={() => sendWhatsApp(sale)} style={{ flex: 1.4, padding: "9px 0", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon d={Icons.whatsapp} size={15} /> WhatsApp
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function SoftcarePOS() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [stock, setStock] = useState(() => loadFromStorage(STORAGE_KEYS.STOCK, DEMO_STOCK));
  const [sales, setSales] = useState(() => loadFromStorage(STORAGE_KEYS.SALES, DEMO_SALES));
  const [reminders, setReminders] = useState(() => loadFromStorage(STORAGE_KEYS.REMINDERS, DEMO_REMINDERS));
  
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState(null);
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 700);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const todaySales = sales.filter(s => s.date?.startsWith(today()));
  const todayRevenue = todaySales.reduce((a, s) => a + s.total, 0);
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
  const lowStock = stock.filter(s => s.quantity < 5 && s.category !== "Service");

  const addToCart = (item) => {
    if (item.category !== "Service" && item.quantity <= 0) {
      showToast(`${item.name} is out of stock`, false);
      return;
    }
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      if (ex) {
        if (item.category !== "Service" && ex.qty + 1 > item.quantity) {
          showToast(`Only ${item.quantity} left in stock`, false);
          return c;
        }
        return c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      }
      return [...c, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(c => c.filter(x => x.id !== id));

  const cartTotal = cart.reduce((a, x) => a + x.price * x.qty, 0);

  const completeSale = () => {
    if (!cart.length) return showToast("Cart is empty", false);

    for (const cartItem of cart) {
      if (cartItem.category !== "Service") {
        const stockItem = stock.find(s => s.id === cartItem.id);
        if (!stockItem || stockItem.quantity < cartItem.qty) {
          showToast(`Not enough stock for ${cartItem.name}. Available: ${stockItem?.quantity || 0}`, false);
          return;
        }
      }
    }

    const sale = {
      id: Date.now(),
      items: JSON.stringify(cart.map(x => ({ name: x.name, qty: x.qty, price: x.price }))),
      total: cartTotal,
      customer: customer || "Walk-in",
      payment,
      phone: phone || "",
      date: new Date().toISOString(),
    };
    setSales(s => [sale, ...s]);

    setStock(st => st.map(item => {
      const inCart = cart.find(c => c.id === item.id);
      if (inCart && item.category !== "Service") {
        return { ...item, quantity: item.quantity - inCart.qty };
      }
      return item;
    }));

    setCart([]);
    setCustomer("");
    setPhone("");
    setLastSale(sale);
    showToast(`Sale of ${fmt(cartTotal)} complete ✓`);
  };

  const addStockItem = (item) => { 
    setStock(s => [...s, { ...item, id: Date.now() }]); 
    showToast("Item added to stock"); 
  };
  
  const deleteStockItem = (id) => { 
    setStock(s => s.filter(x => x.id !== id)); 
    showToast("Item removed"); 
  };
  
  const toggleReminder = (id) => setReminders(r => r.map(x => x.id === id ? { ...x, done: !x.done } : x));
  
  const addReminder = (text, due) => { 
    setReminders(r => [...r, { id: Date.now(), text, due, done: false }]); 
    showToast("Reminder set"); 
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "pos", label: "POS", icon: "pos" },
    { id: "orders", label: "Orders", icon: "orders" },
    { id: "invoices", label: "Invoices", icon: "invoices" },
    { id: "reports", label: "Reports", icon: "reports" },
    { id: "receipts", label: "Receipts", icon: "receipts" },
    { id: "stock", label: "Stock", icon: "stock" },
    { id: "reminders", label: "Reminders", icon: "reminders" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans',sans-serif", background: "#0f172a", overflow: "hidden", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
        .nav-item{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,.75);font-size:14px;font-weight:500;transition:all .15s}
        .nav-item:hover{background:rgba(255,255,255,.1);color:#fff}
        .nav-item.active{background:rgba(255,255,255,.18);color:#fff}
        .btn{padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:all .15s}
        .btn-primary{background:#2563eb;color:#fff}.btn-primary:hover{background:#1d4ed8}
        .btn-success{background:#16a34a;color:#fff}.btn-success:hover{background:#15803d}
        .btn-danger{background:#dc2626;color:#fff}.btn-danger:hover{background:#b91c1c}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #334155}.btn-ghost:hover{background:#1e293b;color:#e2e8f0}
        .btn-wa{background:#16a34a;color:#fff;display:flex;align-items:center;gap:6px}.btn-wa:hover{background:#15803d}
        .card{background:#1e293b;border-radius:14px;padding:20px;border:1px solid #334155}
        .input{width:100%;padding:9px 12px;border:1.5px solid #334155;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border .15s;background:#0f172a;color:#e2e8f0}
        .input:focus{border-color:#2563eb}
        .input::placeholder{color:#475569}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
        .badge-blue{background:rgba(37,99,235,.2);color:#93c5fd}
        .badge-green{background:rgba(22,163,74,.2);color:#86efac}
        .badge-orange{background:rgba(234,88,12,.2);color:#fdba74}
        .badge-gray{background:rgba(100,116,139,.2);color:#94a3b8}
        .table{width:100%;border-collapse:collapse}
        .table th{text-align:left;padding:10px 14px;font-size:11px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #334155}
        .table td{padding:12px 14px;font-size:14px;border-bottom:1px solid #1e293b;color:#cbd5e1}
        .table tr:last-child td{border-bottom:none}
        .table tr:hover td{background:rgba(255,255,255,.03)}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .page-enter{animation:fadeUp .22s ease}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .modal-enter{animation:slideUp .25s cubic-bezier(.2,.8,.2,1)}
      `}</style>

      {isMobile && sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} onClick={() => setSidebarOpen(false)} />
      )}
      <div style={{
        width: 230,
        background: "linear-gradient(160deg,#1e3a8a,#1d4ed8)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        gap: 4,
        flexShrink: 0,
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        transition: "left .25s ease",
      }}>
        <div style={{ padding: "8px 8px 20px", borderBottom: "1px solid rgba(255,255,255,.15)", marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.2)", borderRadius: "50%", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff" }}>S</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Softcare</div>
          <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11 }}>MOBILE SOLUTION</div>
        </div>
        {navItems.map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => { setPage(n.id); if (isMobile) setSidebarOpen(false); }}>
            <Icon d={Icons[n.icon]} size={17} />{n.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div className="nav-item" style={{ opacity: .6 }} onClick={() => showToast("Logged out")}>
          <Icon d={Icons.logout} size={17} /> Log Out
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#1e293b", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #334155", flexShrink: 0 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon d={Icons.menu} size={22} />
            </button>
          )}
          <div style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9", textTransform: "capitalize" }}>
            {page === "pos" ? "Point of Sale" : page.charAt(0).toUpperCase() + page.slice(1)}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {new Date().toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24 }} className="page-enter" key={page}>
          {page === "dashboard" && <Dashboard sales={sales} stock={stock} todayRevenue={todayRevenue} totalRevenue={totalRevenue} lowStock={lowStock} reminders={reminders} setPage={setPage} />}
          {page === "pos" && <POS stock={stock} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} cartTotal={cartTotal} customer={customer} setCustomer={setCustomer} phone={phone} setPhone={setPhone} payment={payment} setPayment={setPayment} completeSale={completeSale} searchQ={searchQ} setSearchQ={setSearchQ} />}
          {page === "orders" && <Orders sales={sales} setSales={setSales} showToast={showToast} />}
          {page === "invoices" && <Invoices sales={sales} setSales={setSales} showToast={showToast} />}
          {page === "reports" && <Reports sales={sales} />}
          {page === "receipts" && <Receipts sales={sales} setSales={setSales} showToast={showToast} />}
          {page === "stock" && <Stock stock={stock} addStockItem={addStockItem} deleteStockItem={deleteStockItem} showToast={showToast} />}
          {page === "reminders" && <Reminders reminders={reminders} toggleReminder={toggleReminder} addReminder={addReminder} />}
        </div>
      </div>

      {lastSale && (
        <div className="overlay" onClick={() => setLastSale(null)}>
          <div className="modal-enter" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: "rgba(74,222,128,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Icon d={Icons.check} size={26} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, color: "#f1f5f9" }}>Sale Complete!</div>
              <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Print or send receipt to customer</div>
            </div>
            <ReceiptCard sale={lastSale} onClose={() => setLastSale(null)} />
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.ok ? "#16a34a" : "#dc2626", color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 300, boxShadow: "0 8px 30px rgba(0,0,0,.4)", animation: "fadeUp .2s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ sales, stock, todayRevenue, totalRevenue, lowStock, reminders, setPage }) {
  const recentSales = sales.slice(0, 6);
  const stats = [
    { label: "Today's Revenue", value: fmt(todayRevenue), color: "#60a5fa", sub: `${sales.filter(s => s.date?.startsWith(today())).length} sales` },
    { label: "Total Revenue", value: fmt(totalRevenue), color: "#4ade80", sub: `${sales.length} total sales` },
    { label: "Total Sales", value: sales.length, color: "#a78bfa", sub: "all time" },
    { label: "Low Stock", value: lowStock.length, color: "#fb923c", sub: lowStock.length === 0 ? "all good" : "items need reorder" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        {stats.map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>Recent Sales</div>
            <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setPage("orders")}>View all</button>
          </div>
          {recentSales.length === 0 && <div style={{ color: "#475569", fontSize: 13 }}>No sales yet</div>}
          {recentSales.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #334155" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 14 }}>{s.customer}</div>
                <div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{timeAgo(s.date)} · {s.payment}</div>
              </div>
              <div style={{ fontWeight: 700, color: "#4ade80", fontSize: 15, marginRight: 10 }}>{fmt(s.total)}</div>
              <button className="btn btn-wa" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => sendWhatsApp(s)}>
                <Icon d={Icons.whatsapp} size={14} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>⚠ Low Stock</div>
            {lowStock.length === 0 ? <div style={{ color: "#475569", fontSize: 13 }}>All stock levels good ✓</div> : lowStock.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #334155", fontSize: 14 }}>
                <span style={{ color: "#cbd5e1" }}>{s.name}</span>
                <span className="badge badge-orange">{s.quantity} left</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 12 }}>🔔 Reminders ({reminders.filter(r => !r.done).length})</div>
            {reminders.filter(r => !r.done).slice(0, 4).map(r => (
              <div key={r.id} style={{ fontSize: 13, color: "#94a3b8", padding: "5px 0", borderBottom: "1px solid #334155" }}>• {r.text}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── POS ─────────────────────────────────────────────────────────────────────
function POS({ stock, cart, addToCart, removeFromCart, cartTotal, customer, setCustomer, phone, setPhone, payment, setPayment, completeSale, searchQ, setSearchQ }) {
  const [cat, setCat] = useState("All");
  const categories = ["All", ...new Set(stock.map(s => s.category))];
  const shown = stock.filter(s => s.name.toLowerCase().includes(searchQ.toLowerCase()) && s.quantity > 0 && (cat === "All" || s.category === cat));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, height: "calc(100vh - 130px)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#475569" }}><Icon d={Icons.search} size={16} /></span>
          <input className="input" placeholder="Search items…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} className="btn" style={{ padding: "5px 14px", fontSize: 13, background: cat === c ? "#2563eb" : "#1e293b", color: cat === c ? "#fff" : "#64748b", border: "1px solid #334155" }} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 10 }}>
            {shown.map(item => (
              <div key={item.id} onClick={() => addToCart(item)} className="card" style={{ cursor: "pointer", transition: "all .15s", border: "1.5px solid #334155" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#1a2c45"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.background = "#1e293b"; }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.category}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#e2e8f0" }}>{item.name}</div>
                <div style={{ fontWeight: 700, color: "#60a5fa", fontSize: 15 }}>{fmt(item.price)}</div>
                {item.category !== "Service" && <div style={{ fontSize: 11, color: item.quantity < 5 ? "#fb923c" : "#475569", marginTop: 4 }}>Stock: {item.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>🛒 Cart {cart.length > 0 && <span className="badge badge-blue" style={{ fontSize: 11 }}>{cart.length}</span>}</div>
        <input className="input" placeholder="Customer name (optional)" value={customer} onChange={e => setCustomer(e.target.value)} style={{ marginBottom: 8 }} />
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#475569" }}><Icon d={Icons.phone} size={14} /></span>
          <input className="input" placeholder="Phone for WhatsApp (e.g. 0712…)" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <div style={{ flex: 1, overflow: "auto", marginBottom: 12 }}>
          {cart.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", marginTop: 40 }}>Tap items to add</div>}
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid #334155" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>{fmt(item.price)} × {item.qty}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{fmt(item.price * item.qty)}</div>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><Icon d={Icons.x} size={15} /></button>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #334155", paddingTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontWeight: 600, color: "#64748b" }}>Total</span><span style={{ fontWeight: 800, fontSize: 22, color: "#4ade80" }}>{fmt(cartTotal)}</span></div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["Cash", "Mpesa", "Card"].map(p => (
              <button key={p} className="btn" style={{ flex: 1, fontSize: 12, padding: "7px 0", background: payment === p ? "#2563eb" : "#0f172a", color: payment === p ? "#fff" : "#64748b", border: "1px solid #334155" }} onClick={() => setPayment(p)}>{p}</button>
            ))}
          </div>
          <button className="btn btn-success" style={{ width: "100%", padding: 13, fontSize: 15 }} onClick={completeSale}>Complete Sale ✓</button>
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS (with delete) ───────────────────────────────────────────────────
function Orders({ sales, setSales, showToast }) {
  const deleteOrder = (id) => {
    if (window.confirm("Delete this order permanently?")) {
      setSales(sales.filter(s => s.id !== id));
      showToast("Order deleted", true);
    }
  };
  return (
    <div className="card">
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#f1f5f9" }}>All Orders ({sales.length})</div>
      <table className="table">
        <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {sales.map((s, i) => {
            const items = JSON.parse(s.items);
            return (
              <tr key={s.id}>
                <td style={{ color: "#475569", fontWeight: 600 }}>#{String(i + 1).padStart(3, "0")}</td>
                <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{s.customer}</td>
                <td style={{ color: "#64748b", fontSize: 13 }}>{items.map(x => `${x.name} ×${x.qty}`).join(", ")}</td>
                <td style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(s.total)}</td>
                <td><span className={`badge ${s.payment === "Mpesa" ? "badge-blue" : s.payment === "Card" ? "badge-orange" : "badge-gray"}`}>{s.payment}</span></td>
                <td style={{ color: "#475569", fontSize: 12 }}>{new Date(s.date).toLocaleDateString("en-KE")}</td>
                <td><span className="badge badge-green">Completed</span></td>
                <td><button onClick={() => deleteOrder(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "4px" }}><Icon d={Icons.trash} size={16} /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── INVOICES (with delete) ─────────────────────────────────────────────────
function Invoices({ sales, setSales, showToast }) {
  const [selected, setSelected] = useState(null);
  const deleteInvoice = (id) => {
    if (window.confirm("Delete this invoice permanently?")) {
      setSales(sales.filter(s => s.id !== id));
      showToast("Invoice deleted", true);
      if (selected && selected.id === id) setSelected(null);
    }
  };
  if (selected) {
    const items = JSON.parse(selected.items);
    const invoiceNum = "INV" + String(selected.id).slice(-6).toUpperCase();
    return (
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div><div style={{ fontWeight: 800, fontSize: 22, color: "#60a5fa" }}>SOFTCARE SOLUTIONS</div><div style={{ color: "#64748b", fontSize: 13 }}>Nairobi CBD · +254 700 123 456</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>INVOICE</div><div style={{ color: "#64748b", fontSize: 13 }}>{invoiceNum}</div><div style={{ color: "#64748b", fontSize: 13 }}>{new Date(selected.date).toLocaleDateString("en-KE")}</div></div>
        </div>
        <div style={{ marginBottom: 16, padding: 14, background: "#0f172a", borderRadius: 8, border: "1px solid #334155" }}><div style={{ fontWeight: 600, marginBottom: 4, color: "#94a3b8", fontSize: 12, textTransform: "uppercase" }}>Bill To</div><div style={{ color: "#e2e8f0", fontWeight: 600 }}>{selected.customer}</div>{selected.phone && <div style={{ color: "#64748b", fontSize: 13 }}>{selected.phone}</div>}</div>
        <table className="table"><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>{items.map((it, i) => <tr key={i}><td>{it.name}</td><td>{it.qty}</td><td>{fmt(it.price)}</td><td style={{ fontWeight: 600, color: "#4ade80" }}>{fmt(it.price * it.qty)}</td></tr>)}</tbody></table>
        <div style={{ marginTop: 16, textAlign: "right" }}><div style={{ fontSize: 18, fontWeight: 800, color: "#4ade80" }}>Total: {fmt(selected.total)}</div><div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Paid via {selected.payment}</div></div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelected(null)}>← Back</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => printReceipt(selected)}>🖨️ Print</button>
          <button className="btn btn-wa" style={{ flex: 1 }} onClick={() => sendWhatsApp(selected)}><Icon d={Icons.whatsapp} size={15} /> WhatsApp</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => deleteInvoice(selected.id)}>Delete</button>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#f1f5f9" }}>Invoices ({sales.length})</div>
      <table className="table"><thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>{sales.map((s, i) => (
        <tr key={s.id}><td style={{ fontWeight: 600, color: "#60a5fa" }}>INV{String(i + 1).padStart(4, "0")}</td><td style={{ color: "#e2e8f0" }}>{s.customer}</td><td style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(s.total)}</td><td style={{ color: "#475569", fontSize: 13 }}>{new Date(s.date).toLocaleDateString("en-KE")}</td><td style={{ display: "flex", gap: 6 }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setSelected(s)}>View</button><button className="btn btn-wa" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => sendWhatsApp(s)}><Icon d={Icons.whatsapp} size={13} /></button><button onClick={() => deleteInvoice(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "5px 10px" }}><Icon d={Icons.trash} size={14} /></button></td></tr>))}</tbody></table>
    </div>
  );
}

// ─── RECEIPTS (with delete) ─────────────────────────────────────────────────
function Receipts({ sales, setSales, showToast }) {
  const [selected, setSelected] = useState(null);
  const deleteReceipt = (id) => {
    if (window.confirm("Delete this receipt permanently?")) {
      setSales(sales.filter(s => s.id !== id));
      showToast("Receipt deleted", true);
      if (selected && selected.id === id) setSelected(null);
    }
  };
  if (selected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 420 }}><button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSelected(null)}>← Back to receipts</button><ReceiptCard sale={selected} onClose={() => setSelected(null)} /><button className="btn btn-danger" style={{ marginTop: 12, width: "100%" }} onClick={() => deleteReceipt(selected.id)}>Delete Receipt</button></div>
      </div>
    );
  }
  return (
    <div className="card">
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#f1f5f9" }}>Receipt History ({sales.length})</div>
      <table className="table"><thead><tr><th>Receipt #</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead><tbody>{sales.map((s, i) => (
        <tr key={s.id}><td style={{ fontWeight: 600, color: "#94a3b8" }}>RC{String(i + 1).padStart(4, "0")}</td><td style={{ fontWeight: 600, color: "#e2e8f0" }}>{s.customer}</td><td style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(s.total)}</td><td><span className={`badge ${s.payment === "Mpesa" ? "badge-blue" : "badge-gray"}`}>{s.payment}</span></td><td style={{ color: "#475569", fontSize: 13 }}>{new Date(s.date).toLocaleDateString("en-KE")}</td><td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setSelected(s)}><Icon d={Icons.eye} size={13} /></button><button className="btn btn-primary" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => printReceipt(s)}><Icon d={Icons.print} size={13} /></button><button className="btn btn-wa" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => sendWhatsApp(s)}><Icon d={Icons.whatsapp} size={13} /></button><button onClick={() => deleteReceipt(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "5px 10px" }}><Icon d={Icons.trash} size={14} /></button></div></td></tr>))}</tbody></table>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ sales }) {
  const byPayment = sales.reduce((a, s) => { a[s.payment] = (a[s.payment] || 0) + s.total; return a; }, {});
  const topItems = Object.entries(sales.flatMap(s => JSON.parse(s.items)).reduce((a, x) => { a[x.name] = (a[x.name] || 0) + x.qty; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const byDay = sales.reduce((a, s) => { const d = s.date?.split("T")[0]; a[d] = (a[d] || 0) + s.total; return a; }, {});
  const totalRev = sales.reduce((a, s) => a + s.total, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card"><div style={{ fontWeight: 700, marginBottom: 16, color: "#f1f5f9" }}>Revenue by Payment</div>{Object.entries(byPayment).map(([k, v]) => (<div key={k} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}><span style={{ fontWeight: 500, color: "#cbd5e1" }}>{k}</span><span style={{ fontWeight: 700, color: "#4ade80" }}>{fmt(v)}</span></div><div style={{ height: 7, background: "#0f172a", borderRadius: 4 }}><div style={{ height: "100%", borderRadius: 4, background: k === "Mpesa" ? "#3b82f6" : k === "Cash" ? "#22c55e" : "#8b5cf6", width: `${(v / totalRev) * 100}%`, transition: "width .5s" }} /></div></div>))}</div>
        <div className="card"><div style={{ fontWeight: 700, marginBottom: 16, color: "#f1f5f9" }}>Top Selling Items</div>{topItems.map(([name, qty], i) => (<div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #334155", fontSize: 14 }}><span style={{ display: "flex", gap: 10, alignItems: "center", color: "#cbd5e1" }}><span style={{ background: "rgba(37,99,235,.3)", color: "#93c5fd", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>{name}</span><span className="badge badge-blue">{qty} sold</span></div>))}</div>
      </div>
      <div className="card"><div style={{ fontWeight: 700, marginBottom: 16, color: "#f1f5f9" }}>Daily Revenue</div><div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 140 }}>{Object.entries(byDay).slice(-7).map(([d, v]) => { const max = Math.max(...Object.values(byDay)); return (<div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ fontSize: 10, fontWeight: 600, color: "#60a5fa" }}>{(v / 1000).toFixed(1)}k</div><div style={{ width: "100%", background: "#3b82f6", borderRadius: "4px 4px 0 0", height: `${(v / max) * 100}px`, minHeight: 4 }} /><div style={{ fontSize: 10, color: "#475569" }}>{d.slice(5)}</div></div>); })}</div></div>
    </div>
  );
}

// ─── STOCK ───────────────────────────────────────────────────────────────────
function Stock({ stock, addStockItem, deleteStockItem, showToast }) {
  const [form, setForm] = useState({ name: "", category: "Parts", price: "", quantity: "" });
  const [adding, setAdding] = useState(false);
  const submit = () => { if (!form.name || !form.price || !form.quantity) return showToast("Fill all fields", false); addStockItem({ ...form, price: Number(form.price), quantity: Number(form.quantity) }); setForm({ name: "", category: "Parts", price: "", quantity: "" }); setAdding(false); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9" }}>Stock Management</div><button className="btn btn-primary" onClick={() => setAdding(a => !a)}>+ Add Item</button></div>
      {adding && (<div className="card" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}><div><label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Item Name</label><input className="input" placeholder="e.g. iPhone 14 Screen" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div><div><label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Category</label><select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{["Parts", "Service", "Accessories"].map(c => <option key={c}>{c}</option>)}</select></div><div><label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Price (Ksh)</label><input className="input" type="number" placeholder="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div><div><label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Quantity</label><input className="input" type="number" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div><button className="btn btn-success" style={{ padding: "9px 16px" }} onClick={submit}>Add</button></div>)}
      <div className="card"><table className="table"><thead><tr><th>Item Name</th><th>Category</th><th>Price</th><th>Qty</th><th>Status</th><th></th></tr></thead><tbody>{stock.map(s => (<tr key={s.id}><td style={{ fontWeight: 600, color: "#e2e8f0" }}>{s.name}</td><td><span className="badge badge-gray">{s.category}</span></td><td style={{ fontWeight: 700, color: "#f1f5f9" }}>{fmt(s.price)}</td><td style={{ fontWeight: 600, color: s.quantity < 5 ? "#fb923c" : "#4ade80" }}>{s.quantity}</td><td><span className={`badge ${s.quantity === 0 ? "badge-orange" : s.quantity < 5 ? "badge-orange" : "badge-green"}`}>{s.quantity === 0 ? "Out of stock" : s.quantity < 5 ? "Low" : "Good"}</span></td><td><button onClick={() => deleteStockItem(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}><Icon d={Icons.trash} size={15} /></button></td></tr>))}</tbody></table></div>
    </div>
  );
}

// ─── REMINDERS ───────────────────────────────────────────────────────────────
function Reminders({ reminders, toggleReminder, addReminder }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState(today());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
      <div className="card"><div style={{ fontWeight: 700, marginBottom: 14, color: "#f1f5f9" }}>Add Reminder</div><div style={{ display: "flex", gap: 10 }}><input className="input" placeholder="e.g. Order iPhone screens" value={text} onChange={e => setText(e.target.value)} style={{ flex: 1 }} /><input className="input" type="date" value={due} onChange={e => setDue(e.target.value)} style={{ width: 150 }} /><button className="btn btn-primary" onClick={() => { if (text) { addReminder(text, due); setText(""); } }}>Add</button></div></div>
      <div className="card"><div style={{ fontWeight: 700, marginBottom: 14, color: "#f1f5f9" }}>Active ({reminders.filter(r => !r.done).length})</div>{reminders.filter(r => !r.done).map(r => (<div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #334155" }}><input type="checkbox" checked={r.done} onChange={() => toggleReminder(r.id)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#2563eb" }} /><div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: 14, color: "#e2e8f0" }}>{r.text}</div><div style={{ fontSize: 12, color: r.due < today() ? "#f87171" : "#475569" }}>Due: {r.due}</div></div></div>))}{reminders.filter(r => r.done).length > 0 && (<><div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>Done</div>{reminders.filter(r => r.done).map(r => (<div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", opacity: .45 }}><input type="checkbox" checked={r.done} onChange={() => toggleReminder(r.id)} style={{ width: 16, height: 16, cursor: "pointer" }} /><div style={{ textDecoration: "line-through", fontSize: 14, color: "#475569" }}>{r.text}</div></div>))}</>)}</div>
    </div>
  );
}