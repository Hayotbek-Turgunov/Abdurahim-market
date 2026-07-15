import React, { useState, useEffect } from 'react';
import './Team.css';

// Standart mahsulotlar (Boshlang'ich ma'lumotlar)
const INITIAL_PRODUCTS = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 17500000, cost: 15000000, quantity: 15, category: 'Texnika', sku: 'IP15PM' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 14800000, cost: 13000000, quantity: 8, category: 'Texnika', sku: 'S24U' },
  { id: 3, name: 'MacBook Air M3', price: 19500000, cost: 17200000, quantity: 5, category: 'Texnika', sku: 'MBA3' },
  { id: 4, name: 'Coca-Cola 1.5L', price: 15000, cost: 11000, quantity: 120, category: 'Oziq-ovqat', sku: 'CC1.5' },
  { id: 5, name: 'Chortoq Mineral Suv 0.5L', price: 8000, cost: 5000, quantity: 80, category: 'Oziq-ovqat', sku: 'CH0.5' },
  { id: 6, name: 'Nike Sport Krossovka', price: 950000, cost: 650000, quantity: 12, category: 'Kiyim-kechak', sku: 'NKB' },
  { id: 7, name: 'Klasik Erkaklar Kostyumi', price: 1800000, cost: 1200000, quantity: 6, category: 'Kiyim-kechak', sku: 'KEK' }
];

// Standart sotuvlar tarixi (Boshlang'ich ma'lumotlar)
const INITIAL_SALES = [
  {
    id: 'TX-1001',
    date: '2026-07-10T11:30:00+05:00',
    customer: 'Jasur Mavlonov',
    items: [
      { id: 4, name: 'Coca-Cola 1.5L', price: 15000, quantity: 2 },
      { id: 1, name: 'iPhone 15 Pro Max', price: 17500000, quantity: 1 }
    ],
    total: 17530000,
    profit: 2508000,
    paymentMethod: 'Karta'
  },
  {
    id: 'TX-1002',
    date: '2026-07-10T14:15:00+05:00',
    customer: 'Aziza Qodirova',
    items: [
      { id: 6, name: 'Nike Sport Krossovka', price: 950000, quantity: 1 }
    ],
    total: 950000,
    profit: 300000,
    paymentMethod: 'Naqd'
  }
];

const Team = () => {
  // LocalStorage dan ma'lumotlarni o'qish
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('pos_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, pos, inventory, history
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Naqd');
  const [discount, setDiscount] = useState(0); // Foizda

  // Qidiruv va filtrlash
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');

  // Mahsulot qo'shish/tahrirlash modali
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '', price: '', cost: '', quantity: '', category: 'Texnika', sku: ''
  });

  // Chek (Receipt) modali
  const [showReceipt, setShowReceipt] = useState(null);

  // Ma'lumotlarni saqlash
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }, [sales]);

  // Kategoriyalar ro'yxati
  const categories = ['Barchasi', ...new Set(products.map(p => p.category))];

  // 1. KASSA / POS funksiyalari
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert('Bu mahsulot omborda qolmagan!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    const cartQty = existingItem ? existingItem.quantity : 0;

    if (cartQty >= product.quantity) {
      alert('Ombordagidan ko\'p mahsulot tanlash mumkin emas!');
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== id));
      return;
    }

    const product = products.find(p => p.id === id);
    if (newQty > product.quantity) {
      alert('Ombordagidan ko\'p mahsulot tanlash mumkin emas!');
      return;
    }

    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const getCartSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getCartDiscountValue = () => (getCartSubtotal() * discount) / 100;
  const getCartTotal = () => getCartSubtotal() - getCartDiscountValue();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Savat bo\'sh!');
      return;
    }

    // Ombordagi sonlarni kamaytirish
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, quantity: p.quantity - cartItem.quantity };
      }
      return p;
    });

    // Foydani hisoblash
    const totalProfit = cart.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.id);
      const cost = prod ? prod.cost : item.price;
      return sum + ((item.price - cost) * item.quantity);
    }, 0) - getCartDiscountValue();

    const newSale = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      customer: customerName.trim() || 'Mijoz',
      items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      total: getCartTotal(),
      profit: Math.max(0, totalProfit),
      paymentMethod
    };

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    setCart([]);
    setCustomerName('');
    setDiscount(0);
    setShowReceipt(newSale); // Chekni ko'rsatish
  };

  // 2. INVENTORY (OMBOR) funksiyalari
  const handleProductSubmit = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(productFormData.price);
    const costNum = parseFloat(productFormData.cost);
    const qtyNum = parseInt(productFormData.quantity);

    if (priceNum <= costNum) {
      alert('Sotish narxi tan narxidan katta bo\'lishi kerak!');
      return;
    }

    if (editingProduct) {
      // Tahrirlash
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...productFormData, id: p.id, price: priceNum, cost: costNum, quantity: qtyNum }
          : p
      ));
      setEditingProduct(null);
    } else {
      // Yangi qo'shish
      const newProduct = {
        ...productFormData,
        id: Date.now(),
        price: priceNum,
        cost: costNum,
        quantity: qtyNum,
        sku: productFormData.sku || `SKU-${Date.now().toString().slice(-4)}`
      };
      setProducts([...products, newProduct]);
    }

    setProductFormData({ name: '', price: '', cost: '', quantity: '', category: 'Texnika', sku: '' });
    setIsProductModalOpen(false);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      price: product.price.toString(),
      cost: product.cost.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      sku: product.sku
    });
    setIsProductModalOpen(true);
  };

  const deleteProduct = (id) => {
    if (confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // 3. DASHBOARD STATS
  const getTodaySalesSum = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sales
      .filter(s => s.date.startsWith(todayStr))
      .reduce((sum, s) => sum + s.total, 0);
  };

  const getTodayProfitSum = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sales
      .filter(s => s.date.startsWith(todayStr))
      .reduce((sum, s) => sum + s.profit, 0);
  };

  const getLowStockCount = () => products.filter(p => p.quantity <= 5).length;
  const getTotalStockValue = () => products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);

  // So'nggi haftalik sotuvlar ma'lumotlari (SVG chart uchun)
  const getWeeklyChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = sales.filter(s => s.date.startsWith(date));
      const total = daySales.reduce((sum, s) => sum + s.total, 0);
      const name = new Date(date).toLocaleDateString('uz-UZ', { weekday: 'short' });
      return { date, name, total };
    });
  };

  const weeklyData = getWeeklyChartData();
  const maxWeeklySale = Math.max(...weeklyData.map(d => d.total), 1000000);

  // Tranzaksiyani bekor qilish (Refund)
  const handleRefund = (saleId) => {
    if (!confirm('Ushbu sotuvni bekor qilib, mahsulotlarni omborga qaytarasizmi?')) return;

    const saleToRefund = sales.find(s => s.id === saleId);
    if (!saleToRefund) return;

    // Ombordagi miqdorlarni qaytarish
    const restoredProducts = products.map(p => {
      const soldItem = saleToRefund.items.find(item => item.id === p.id);
      if (soldItem) {
        return { ...p, quantity: p.quantity + soldItem.quantity };
      }
      return p;
    });

    setProducts(restoredProducts);
    setSales(sales.filter(s => s.id !== saleId));
  };

  const formatMoney = (val) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="sales-app">
      {/* 1. SIDEBAR */}
      <aside className="sales-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">📊</div>
          <h2>SmartSotuv</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="icon">🏠</span> Boshqaruv Paneli
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            <span className="icon">🛒</span> Savdo Kassa (POS)
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <span className="icon">📦</span> Omborxona
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="icon">📜</span> Sotuvlar Tarixi
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">A</div>
            <div>
              <h4>Administrator</h4>
              <p>Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="sales-main">
        {/* TOP BAR */}
        <header className="sales-header">
          <div className="header-title">
            <h1>{activeTab === 'dashboard' ? 'Boshqaruv Paneli' : 
                 activeTab === 'pos' ? 'Savdo Kassa' : 
                 activeTab === 'inventory' ? 'Omborxona va Mahsulotlar' : 'Sotuvlar Tarixi'}</h1>
            <p>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {activeTab === 'inventory' && (
            <button className="add-product-btn hover-lift" onClick={() => {
              setEditingProduct(null);
              setProductFormData({ name: '', price: '', cost: '', quantity: '', category: 'Texnika', sku: '' });
              setIsProductModalOpen(true);
            }}>
              + Yangi Mahsulot
            </button>
          )}
        </header>

        {/* ==========================================
            TAB 1: DASHBOARD
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="tab-content animate-fade-in-up">
            {/* STAT CARDS */}
            <div className="stats-container">
              <div className="stat-card hover-lift">
                <div className="stat-icon-wrapper sales-icon">💰</div>
                <div className="stat-info">
                  <p className="stat-label">Bugungi Sotuv</p>
                  <h3 className="stat-value">{formatMoney(getTodaySalesSum())}</h3>
                </div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-icon-wrapper profit-icon">📈</div>
                <div className="stat-info">
                  <p className="stat-label">Bugungi Foyda</p>
                  <h3 className="stat-value">{formatMoney(getTodayProfitSum())}</h3>
                </div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-icon-wrapper stock-icon">📦</div>
                <div className="stat-info">
                  <p className="stat-label">Ombor Umumiy Qiymati</p>
                  <h3 className="stat-value">{formatMoney(getTotalStockValue())}</h3>
                </div>
              </div>
              <div className="stat-card hover-lift warning-card">
                <div className="stat-icon-wrapper alert-icon">⚠️</div>
                <div className="stat-info">
                  <p className="stat-label">Kam Qolgan Mahsulotlar</p>
                  <h3 className="stat-value">{getLowStockCount()} ta</h3>
                </div>
              </div>
            </div>

            {/* CHART & DYNAMIC VIEWS */}
            <div className="dashboard-grid">
              {/* Weekly Sales Chart */}
              <div className="chart-card">
                <h3>Haftalik Savdo Dinamikasi</h3>
                <div className="svg-chart-container">
                  <svg className="svg-chart" viewBox="0 0 500 200">
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.08)" />

                    {/* Bars */}
                    {weeklyData.map((d, index) => {
                      const barHeight = (d.total / maxWeeklySale) * 130;
                      const x = 60 + index * 60;
                      const y = 170 - barHeight;
                      return (
                        <g key={index} className="chart-bar-group">
                          {/* Shadow glow under bars */}
                          <rect 
                            x={x} y={y} width="30" height={barHeight} 
                            rx="5" fill="url(#chartGradient)"
                          />
                          <text x={x + 15} y="190" textAnchor="middle" fill="#9ca3af" fontSize="10">
                            {d.name}
                          </text>
                          {/* Value tooltip on hover */}
                          <text x={x + 15} y={y - 8} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" className="bar-value">
                            {d.total > 0 ? `${(d.total / 1000).toFixed(0)}k` : ''}
                          </text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Recent Sales List */}
              <div className="recent-sales-card">
                <h3>So'nggi Tranzaksiyalar</h3>
                <div className="recent-sales-list">
                  {sales.slice(0, 5).map((sale, idx) => (
                    <div key={idx} className="recent-sale-item">
                      <div className="sale-avatar">{sale.customer.slice(0, 2).toUpperCase()}</div>
                      <div className="sale-details">
                        <h4>{sale.customer}</h4>
                        <p>{new Date(sale.date).toLocaleTimeString('uz-UZ')} • {sale.paymentMethod}</p>
                      </div>
                      <div className="sale-amount">
                        <span>{formatMoney(sale.total)}</span>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && <p className="empty-text">Hozircha sotuvlar mavjud emas.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: POINT OF SALE (POS)
            ========================================== */}
        {activeTab === 'pos' && (
          <div className="pos-layout animate-fade-in">
            {/* Products grid */}
            <div className="pos-products-panel">
              <div className="pos-filters">
                <input 
                  type="text" 
                  placeholder="Mahsulot qidirish..." 
                  className="search-input-field" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="category-scroll">
                  {categories.map((cat, idx) => (
                    <button 
                      key={idx} 
                      className={`category-tag ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pos-products-grid">
                {products
                  .filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCat = selectedCategory === 'Barchasi' || p.category === selectedCategory;
                    return matchesSearch && matchesCat;
                  })
                  .map(product => (
                    <div 
                      key={product.id} 
                      className={`pos-product-card hover-lift ${product.quantity <= 0 ? 'out-of-stock' : ''}`}
                      onClick={() => addToCart(product)}
                    >
                      <span className="product-category-badge">{product.category}</span>
                      <div className="pos-product-info">
                        <h4>{product.name}</h4>
                        <p className="sku-text">SKU: {product.sku}</p>
                        <p className="stock-text">Qoldiq: {product.quantity} ta</p>
                      </div>
                      <div className="pos-product-footer">
                        <span className="price-tag">{formatMoney(product.price)}</span>
                        <button className="add-to-cart-btn" disabled={product.quantity <= 0}>
                          {product.quantity <= 0 ? 'Qolmagan' : '+'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Cart checkout panel */}
            <div className="pos-cart-panel">
              <h3>Xarid Savati</h3>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>{formatMoney(item.price)}</p>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateCartQty(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <p>Savat bo'sh. Mahsulot ustiga bosib qo'shing.</p>
                  </div>
                )}
              </div>

              <div className="cart-summary">
                {/* Customer name input */}
                <div className="checkout-field">
                  <label>Mijoz ismi:</label>
                  <input 
                    type="text" 
                    placeholder="Mijoz ismi (ixtiyoriy)" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Discount select */}
                <div className="checkout-field">
                  <label>Chegirma (%):</label>
                  <select value={discount} onChange={(e) => setDiscount(parseInt(e.target.value))}>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div className="checkout-field">
                  <label>To'lov Turi:</label>
                  <div className="payment-options">
                    {['Naqd', 'Karta', 'Click/Payme'].map(method => (
                      <button 
                        key={method} 
                        className={`payment-option-btn ${paymentMethod === method ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="summary-math">
                  <div className="math-row">
                    <span>Jami:</span>
                    <span>{formatMoney(getCartSubtotal())}</span>
                  </div>
                  <div className="math-row discount">
                    <span>Chegirma:</span>
                    <span>-{formatMoney(getCartDiscountValue())}</span>
                  </div>
                  <div className="math-row grand-total">
                    <span>To'lanadigan:</span>
                    <span>{formatMoney(getCartTotal())}</span>
                  </div>
                </div>

                <button 
                  className="checkout-submit-btn hover-glow hover-lift" 
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                >
                  Sotishni Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: INVENTORY
            ========================================== */}
        {activeTab === 'inventory' && (
          <div className="inventory-layout animate-fade-in">
            <div className="inventory-filters">
              <input 
                type="text" 
                placeholder="Nomi yoki SKU bo'yicha qidirish..." 
                className="search-input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Mahsulot Nomi</th>
                    <th>Kategoriya</th>
                    <th>Tan Narxi</th>
                    <th>Sotish Narxi</th>
                    <th>Ombor Miqdori</th>
                    <th>Status</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(product => {
                      const isLow = product.quantity <= 5;
                      const isOut = product.quantity === 0;
                      return (
                        <tr key={product.id}>
                          <td className="sku-cell">{product.sku}</td>
                          <td className="name-cell">{product.name}</td>
                          <td><span className="category-badge">{product.category}</span></td>
                          <td>{formatMoney(product.cost)}</td>
                          <td className="price-cell">{formatMoney(product.price)}</td>
                          <td className={`quantity-cell ${isOut ? 'out' : isLow ? 'low' : ''}`}>{product.quantity} ta</td>
                          <td>
                            <span className={`status-badge ${isOut ? 'out' : isLow ? 'low' : 'good'}`}>
                              {isOut ? 'Tugagan' : isLow ? 'Kam qolgan' : 'Etarli'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button className="edit-btn" onClick={() => openEditModal(product)}>✏️</button>
                            <button className="delete-btn" onClick={() => deleteProduct(product.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: SALES HISTORY
            ========================================== */}
        {activeTab === 'history' && (
          <div className="history-layout animate-fade-in">
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Tranzaksiya ID</th>
                    <th>Sana va Vaqt</th>
                    <th>Mijoz</th>
                    <th>Mahsulotlar</th>
                    <th>To'lov Turi</th>
                    <th>Jami Summa</th>
                    <th>Sof Foyda</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td className="tx-id-cell">{sale.id}</td>
                      <td>{new Date(sale.date).toLocaleString('uz-UZ')}</td>
                      <td className="customer-cell">{sale.customer}</td>
                      <td className="items-list-cell">
                        {sale.items.map((item, idx) => (
                          <div key={idx}>{item.name} ({item.quantity}x)</div>
                        ))}
                      </td>
                      <td><span className={`method-badge ${sale.paymentMethod.replace('/', '')}`}>{sale.paymentMethod}</span></td>
                      <td className="total-cell">{formatMoney(sale.total)}</td>
                      <td className="profit-cell">{formatMoney(sale.profit)}</td>
                      <td className="actions-cell">
                        <button className="receipt-btn" onClick={() => setShowReceipt(sale)}>🧾 Chek</button>
                        <button className="refund-btn" onClick={() => handleRefund(sale.id)}>🔄 Bekor qilish</button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-table-cell">Hech qanday sotuv tranzaksiyasi topilmadi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          MODAL: PRODUCT ADD / EDIT
          ========================================== */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-in">
            <header className="modal-header">
              <h3>{editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish'}</h3>
              <button className="close-modal-btn" onClick={() => setIsProductModalOpen(false)}>×</button>
            </header>
            <form onSubmit={handleProductSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group-pos">
                  <label>Mahsulot Nomi *</label>
                  <input 
                    type="text" 
                    required 
                    value={productFormData.name} 
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    placeholder="Masalan: Coca-Cola 1.5L"
                  />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group-pos">
                  <label>Tan Narxi (Cost) *</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={productFormData.cost} 
                    onChange={(e) => setProductFormData({ ...productFormData, cost: e.target.value })}
                    placeholder="UZS"
                  />
                </div>
                <div className="form-group-pos">
                  <label>Sotish Narxi (Price) *</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={productFormData.price} 
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="UZS"
                  />
                </div>
                <div className="form-group-pos">
                  <label>Ombor Miqdori *</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={productFormData.quantity} 
                    onChange={(e) => setProductFormData({ ...productFormData, quantity: e.target.value })}
                    placeholder="Soni"
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group-pos">
                  <label>Kategoriya</label>
                  <select 
                    value={productFormData.category} 
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                  >
                    <option value="Texnika">Texnika</option>
                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                    <option value="Kiyim-kechak">Kiyim-kechak</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
                <div className="form-group-pos">
                  <label>SKU Kod (Ixtiyoriy)</label>
                  <input 
                    type="text" 
                    value={productFormData.sku} 
                    onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                    placeholder="Masalan: CC-1.5"
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsProductModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn-save">{editingProduct ? 'Saqlash' : 'Qo\'shish'}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: RECEIPT (CHEK)
          ========================================== */}
      {showReceipt && (
        <div className="modal-overlay">
          <div className="receipt-modal-card animate-scale-in">
            <div className="receipt-paper">
              <div className="receipt-header">
                <h2>SMARTSOTUV DO'KONI</h2>
                <p>Manzil: Toshkent shahar, Chilonzor 1-kvartal</p>
                <p>Tel: +998 90 123 45 67</p>
                <div className="dashed-line"></div>
              </div>
              <div className="receipt-details">
                <p><strong>Tranzaksiya:</strong> {showReceipt.id}</p>
                <p><strong>Sana:</strong> {new Date(showReceipt.date).toLocaleString('uz-UZ')}</p>
                <p><strong>Mijoz:</strong> {showReceipt.customer}</p>
                <p><strong>To'lov turi:</strong> {showReceipt.paymentMethod}</p>
                <div className="dashed-line"></div>
              </div>
              <div className="receipt-items">
                <div className="receipt-item-header">
                  <span>Mahsulot</span>
                  <span>Miqdor x Narx</span>
                  <span>Jami</span>
                </div>
                <div className="solid-line"></div>
                {showReceipt.items.map((item, idx) => (
                  <div key={idx} className="receipt-item-row">
                    <span className="item-name">{item.name}</span>
                    <span>{item.quantity} x {formatMoney(item.price)}</span>
                    <span>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="dashed-line"></div>
              </div>
              <div className="receipt-totals">
                <div className="math-row">
                  <span>Jami summa:</span>
                  <span>{formatMoney(showReceipt.total)}</span>
                </div>
                <p className="thanks-msg">Xaridingiz uchun rahmat!</p>
              </div>
            </div>
            <div className="receipt-actions">
              <button className="receipt-print-btn hover-scale" onClick={() => window.print()}>🖨️ Chop etish</button>
              <button className="receipt-close-btn hover-scale" onClick={() => setShowReceipt(null)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
