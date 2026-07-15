import { useState, useEffect, useCallback } from 'react';
import './Team.css';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 17500000, cost: 15000000, quantity: 15, category: 'Texnika', sku: 'IP15PM', icon: '📱' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 14800000, cost: 13000000, quantity: 8, category: 'Texnika', sku: 'S24U', icon: '📱' },
  { id: 3, name: 'MacBook Air M3', price: 19500000, cost: 17200000, quantity: 5, category: 'Texnika', sku: 'MBA3', icon: '💻' },
  { id: 4, name: 'Coca-Cola 1.5L', price: 15000, cost: 11000, quantity: 120, category: 'Oziq-ovqat', sku: 'CC1.5', icon: '🥤' },
  { id: 5, name: 'Chortoq Mineral Suv 0.5L', price: 8000, cost: 5000, quantity: 80, category: 'Oziq-ovqat', sku: 'CH0.5', icon: '💧' },
  { id: 6, name: 'Nike Sport Krossovka', price: 950000, cost: 650000, quantity: 12, category: 'Kiyim-kechak', sku: 'NKB', icon: '👟' },
  { id: 7, name: 'Klasik Erkaklar Kostyumi', price: 1800000, cost: 1200000, quantity: 6, category: 'Kiyim-kechak', sku: 'KEK', icon: '👔' },
];

const INITIAL_SALES = [
  {
    id: 'TX-1001',
    date: '2026-07-10T11:30:00+05:00',
    customer: 'Jasur Mavlonov',
    items: [
      { id: 4, name: 'Coca-Cola 1.5L', price: 15000, quantity: 2 },
      { id: 1, name: 'iPhone 15 Pro Max', price: 17500000, quantity: 1 },
    ],
    total: 17530000,
    profit: 2508000,
    paymentMethod: 'Karta',
  },
  {
    id: 'TX-1002',
    date: '2026-07-10T14:15:00+05:00',
    customer: 'Aziza Qodirova',
    items: [{ id: 6, name: 'Nike Sport Krossovka', price: 950000, quantity: 1 }],
    total: 950000,
    profit: 300000,
    paymentMethod: 'Naqd',
  },
];

const formatMoney = (val) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(val);

const Team = () => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('pos_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Naqd');
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    cost: '',
    quantity: '',
    category: 'Texnika',
    sku: '',
  });
  const [showReceipt, setShowReceipt] = useState(null);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }, [sales]);

  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const categories = ['Barchasi', ...new Set(products.map((p) => p.category))];

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      showNotif('Bu mahsulot omborda qolmagan!', 'error');
      return;
    }
    const existingItem = cart.find((item) => item.id === product.id);
    const cartQty = existingItem ? existingItem.quantity : 0;
    if (cartQty >= product.quantity) {
      showNotif("Ombordagidan ko'p mahsulot tanlash mumkin emas!", 'error');
      return;
    }
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 400);
    showNotif(`${product.name} savatga qo'shildi`);
  };

  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter((item) => item.id !== id));
      return;
    }
    const product = products.find((p) => p.id === id);
    if (newQty > product.quantity) {
      showNotif("Ombordagidan ko'p mahsulot tanlash mumkin emas!", 'error');
      return;
    }
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
  };

  const getCartSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getCartDiscountValue = () => (getCartSubtotal() * discount) / 100;
  const getCartTotal = () => getCartSubtotal() - getCartDiscountValue();

  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotif("Savat bo'sh!", 'error');
      return;
    }
    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((item) => item.id === p.id);
      if (cartItem) return { ...p, quantity: p.quantity - cartItem.quantity };
      return p;
    });
    const totalProfit =
      cart.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.id);
        const cost = prod ? prod.cost : item.price;
        return sum + (item.price - cost) * item.quantity;
      }, 0) - getCartDiscountValue();

    const newSale = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      customer: customerName.trim() || 'Mijoz',
      items: cart.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      total: getCartTotal(),
      profit: Math.max(0, totalProfit),
      paymentMethod,
    };

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    setCart([]);
    setCustomerName('');
    setDiscount(0);
    setShowReceipt(newSale);
    showNotif('Sotuv muvaffaqiyatli amalga oshirildi!');
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(productFormData.price);
    const costNum = parseFloat(productFormData.cost);
    const qtyNum = parseInt(productFormData.quantity);
    if (priceNum <= costNum) {
      showNotif("Sotish narxi tan narxidan katta bo'lishi kerak!", 'error');
      return;
    }
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...productFormData, id: p.id, price: priceNum, cost: costNum, quantity: qtyNum } : p
        )
      );
      showNotif('Mahsulot yangilandi!');
    } else {
      const newProduct = {
        ...productFormData,
        id: Date.now(),
        price: priceNum,
        cost: costNum,
        quantity: qtyNum,
        sku: productFormData.sku || `SKU-${Date.now().toString().slice(-4)}`,
        icon: '📦',
      };
      setProducts([...products, newProduct]);
      showNotif('Yangi mahsulot qo\'shildi!');
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
      sku: product.sku,
    });
    setIsProductModalOpen(true);
  };

  const deleteProduct = (id) => {
    if (confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
      setProducts(products.filter((p) => p.id !== id));
      showNotif("Mahsulot o'chirildi", 'error');
    }
  };

  const getTodaySalesSum = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sales.filter((s) => s.date.startsWith(todayStr)).reduce((sum, s) => sum + s.total, 0);
  };

  const getTodayProfitSum = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sales.filter((s) => s.date.startsWith(todayStr)).reduce((sum, s) => sum + s.profit, 0);
  };

  const getLowStockCount = () => products.filter((p) => p.quantity <= 5).length;
  const getTotalStockValue = () => products.reduce((sum, p) => sum + p.cost * p.quantity, 0);

  const getWeeklyChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
    return last7Days.map((date) => {
      const daySales = sales.filter((s) => s.date.startsWith(date));
      const total = daySales.reduce((sum, s) => sum + s.total, 0);
      const name = new Date(date).toLocaleDateString('uz-UZ', { weekday: 'short' });
      return { date, name, total };
    });
  };

  const weeklyData = getWeeklyChartData();
  const maxWeeklySale = Math.max(...weeklyData.map((d) => d.total), 1000000);

  const handleRefund = (saleId) => {
    if (!confirm("Ushbu sotuvni bekor qilib, mahsulotlarni omborga qaytarasizmi?")) return;
    const saleToRefund = sales.find((s) => s.id === saleId);
    if (!saleToRefund) return;
    const restoredProducts = products.map((p) => {
      const soldItem = saleToRefund.items.find((item) => item.id === p.id);
      if (soldItem) return { ...p, quantity: p.quantity + soldItem.quantity };
      return p;
    });
    setProducts(restoredProducts);
    setSales(sales.filter((s) => s.id !== saleId));
    showNotif("Sotuv bekor qilindi, mahsulotlar qaytarildi", 'error');
  };

  return (
    <div className="sales-app">
      {notification && (
        <div className={`notification-toast ${notification.type} animate-slide-in-right`}>
          <span className="notif-icon">{notification.type === 'success' ? '✓' : '✕'}</span>
          {notification.msg}
        </div>
      )}

      <aside className={`sales-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-wrapper">
            <div className="brand-logo">📊</div>
          </div>
          {!sidebarCollapsed && <h2>SmartSotuv</h2>}
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Boshqaruv Paneli' },
            { id: 'pos', icon: '🛒', label: 'Savdo Kassa' },
            { id: 'inventory', icon: '📦', label: 'Omborxona' },
            { id: 'history', icon: '📜', label: 'Sotuvlar Tarixi' },
          ].map((item) => (
            <button
              key={item.id}
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
              {activeTab === item.id && <span className="active-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar-wrapper">
              <div className="avatar">A</div>
              <span className="online-dot" />
            </div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <h4>Administrator</h4>
                <p>Online</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="sales-main">
        <header className="sales-header">
          <div className="header-title">
            <h1>
              {activeTab === 'dashboard' && 'Boshqaruv Paneli'}
              {activeTab === 'pos' && 'Savdo Kassa'}
              {activeTab === 'inventory' && 'Omborxona'}
              {activeTab === 'history' && 'Sotuvlar Tarixi'}
            </h1>
            <p className="header-date">
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="header-actions">
            {activeTab === 'inventory' && (
              <button
                className="add-product-btn hover-lift"
                onClick={() => {
                  setEditingProduct(null);
                  setProductFormData({ name: '', price: '', cost: '', quantity: '', category: 'Texnika', sku: '' });
                  setIsProductModalOpen(true);
                }}
              >
                <span>+</span> Yangi Mahsulot
              </button>
            )}
            <div className="header-time">{new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </header>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="tab-content animate-fade-in-up">
            <div className="stats-container">
              {[
                { label: 'Bugungi Sotuv', value: formatMoney(getTodaySalesSum()), icon: '💰', colorClass: 'blue' },
                { label: 'Bugungi Foyda', value: formatMoney(getTodayProfitSum()), icon: '📈', colorClass: 'green' },
                { label: 'Ombor Qiymati', value: formatMoney(getTotalStockValue()), icon: '📦', colorClass: 'purple' },
                {
                  label: 'Kam Qolgan',
                  value: `${getLowStockCount()} ta`,
                  icon: '⚠️',
                  colorClass: 'orange',
                  isWarning: getLowStockCount() > 0,
                },
              ].map((stat, i) => (
                <div
                  className={`stat-card hover-lift ${stat.isWarning ? 'warning-card' : ''}`}
                  key={i}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`stat-icon-wrapper ${stat.colorClass}`}>
                    <span>{stat.icon}</span>
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">{stat.label}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                  </div>
                  <div className={`stat-glow ${stat.colorClass}`} />
                </div>
              ))}
            </div>

            <div className="dashboard-grid">
              <div className="chart-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="card-header">
                  <h3>Haftalik Savdo Dinamikasi</h3>
                  <span className="card-badge">7 kun</span>
                </div>
                <div className="svg-chart-container">
                  <svg className="svg-chart" viewBox="0 0 520 220">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {[30, 70, 120, 170].map((y) => (
                      <line key={y} x1="45" y1={y} x2="495" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    ))}

                    {weeklyData.map((d, index) => {
                      const barHeight = Math.max((d.total / maxWeeklySale) * 130, 4);
                      const x = 60 + index * 62;
                      const y = 170 - barHeight;
                      return (
                        <g key={index} className="chart-bar-group">
                          <rect x={x - 2} y={170} width="34" height={barHeight + 4} rx="6" fill="url(#chartGlow)" className="bar-glow" />
                          <rect x={x} y={y} width="30" height={barHeight} rx="5" fill="url(#chartGradient)" className="bar-main" />
                          <rect x={x} y={y} width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" className="bar-highlight" />
                          <text x={x + 15} y="192" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                            {d.name}
                          </text>
                          <text x={x + 15} y={y - 10} textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="700" className="bar-value">
                            {d.total > 0 ? `${(d.total / 1000).toFixed(0)}k` : ''}
                          </text>
                        </g>
                      );
                    })}

                    <line x1="45" y1="170" x2="495" y2="170" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              <div className="recent-sales-card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="card-header">
                  <h3>So'nggi Tranzaksiyalar</h3>
                  <span className="card-badge">{sales.length} ta</span>
                </div>
                <div className="recent-sales-list">
                  {sales.slice(0, 5).map((sale, idx) => (
                    <div
                      key={idx}
                      className="recent-sale-item"
                      style={{ animationDelay: `${0.6 + idx * 0.08}s` }}
                    >
                      <div className="sale-avatar">{sale.customer.slice(0, 2).toUpperCase()}</div>
                      <div className="sale-details">
                        <h4>{sale.customer}</h4>
                        <p>
                          {new Date(sale.date).toLocaleTimeString('uz-UZ')} &bull; {sale.paymentMethod}
                        </p>
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

        {/* POS */}
        {activeTab === 'pos' && (
          <div className="pos-layout animate-fade-in">
            <div className="pos-products-panel">
              <div className="pos-filters">
                <div className="search-wrapper">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Mahsulot qidirish..."
                    className="search-input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                  .filter((p) => {
                    const matchesSearch =
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCat = selectedCategory === 'Barchasi' || p.category === selectedCategory;
                    return matchesSearch && matchesCat;
                  })
                  .map((product, idx) => (
                    <div
                      key={product.id}
                      className={`pos-product-card hover-lift ${product.quantity <= 0 ? 'out-of-stock' : ''}`}
                      onClick={() => addToCart(product)}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <span className="product-category-badge">{product.category}</span>
                      <div className="pos-product-icon">{product.icon || '📦'}</div>
                      <div className="pos-product-info">
                        <h4>{product.name}</h4>
                        <p className="sku-text">SKU: {product.sku}</p>
                        <p className={`stock-text ${product.quantity <= 5 ? 'low' : ''}`}>Qoldiq: {product.quantity} ta</p>
                      </div>
                      <div className="pos-product-footer">
                        <span className="price-tag">{formatMoney(product.price)}</span>
                        <button className="add-to-cart-btn" disabled={product.quantity <= 0}>
                          {product.quantity <= 0 ? '✕' : '+'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className={`pos-cart-panel ${cartAnimation ? 'cart-bump' : ''}`}>
              <div className="cart-header">
                <h3>
                  <span className="cart-icon">🛒</span> Xarid Savati
                </h3>
                {cart.length > 0 && <span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item animate-fade-in">
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>{formatMoney(item.price)}</p>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateCartQty(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">{formatMoney(item.price * item.quantity)}</div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <p>Savat bo'sh</p>
                    <span>Mahsulot ustiga bosib qo'shing</span>
                  </div>
                )}
              </div>

              <div className="cart-summary">
                <div className="checkout-field">
                  <label>Mijoz ismi</label>
                  <input
                    type="text"
                    placeholder="Mijoz ismi (ixtiyoriy)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="checkout-field">
                  <label>Chegirma (%)</label>
                  <div className="discount-options">
                    {[0, 5, 10, 15, 20].map((val) => (
                      <button
                        key={val}
                        className={`discount-btn ${discount === val ? 'active' : ''}`}
                        onClick={() => setDiscount(val)}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="checkout-field">
                  <label>To'lov Turi</label>
                  <div className="payment-options">
                    {[
                      { value: 'Naqd', icon: '💵' },
                      { value: 'Karta', icon: '💳' },
                      { value: 'Click/Payme', icon: '📱' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        className={`payment-option-btn ${paymentMethod === method.value ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        <span>{method.icon}</span>
                        <span>{method.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="summary-math">
                  <div className="math-row">
                    <span>Jami:</span>
                    <span>{formatMoney(getCartSubtotal())}</span>
                  </div>
                  {discount > 0 && (
                    <div className="math-row discount">
                      <span>Chegirma ({discount}%):</span>
                      <span>-{formatMoney(getCartDiscountValue())}</span>
                    </div>
                  )}
                  <div className="math-row grand-total">
                    <span>To'lanadigan:</span>
                    <span>{formatMoney(getCartTotal())}</span>
                  </div>
                </div>

                <button className="checkout-submit-btn hover-glow hover-lift" disabled={cart.length === 0} onClick={handleCheckout}>
                  <span className="btn-content">
                    ✓ Sotishni Tasdiqlash
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="inventory-layout animate-fade-in">
            <div className="inventory-filters">
              <div className="search-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Nomi yoki SKU bo'yicha qidirish..."
                  className="search-input-field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Mahsulot</th>
                    <th>Kategoriya</th>
                    <th>Tan Narxi</th>
                    <th>Sotish Narxi</th>
                    <th>Miqdor</th>
                    <th>Status</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product) => {
                      const isLow = product.quantity <= 5;
                      const isOut = product.quantity === 0;
                      return (
                        <tr key={product.id}>
                          <td className="sku-cell">{product.sku}</td>
                          <td className="name-cell">
                            <span className="product-icon-cell">{product.icon || '📦'}</span>
                            {product.name}
                          </td>
                          <td>
                            <span className="category-badge">{product.category}</span>
                          </td>
                          <td>{formatMoney(product.cost)}</td>
                          <td className="price-cell">{formatMoney(product.price)}</td>
                          <td className={`quantity-cell ${isOut ? 'out' : isLow ? 'low' : ''}`}>{product.quantity} ta</td>
                          <td>
                            <span className={`status-badge ${isOut ? 'out' : isLow ? 'low' : 'good'}`}>
                              {isOut ? 'Tugagan' : isLow ? 'Kam qolgan' : 'Etarli'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button className="edit-btn" onClick={() => openEditModal(product)} title="Tahrirlash">
                              ✏️
                            </button>
                            <button className="delete-btn" onClick={() => deleteProduct(product.id)} title="O'chirish">
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div className="history-layout animate-fade-in">
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sana</th>
                    <th>Mijoz</th>
                    <th>Mahsulotlar</th>
                    <th>To'lov</th>
                    <th>Jami</th>
                    <th>Foyda</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="tx-id-cell">{sale.id}</td>
                      <td>{new Date(sale.date).toLocaleString('uz-UZ')}</td>
                      <td className="customer-cell">{sale.customer}</td>
                      <td className="items-list-cell">
                        {sale.items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} ({item.quantity}x)
                          </div>
                        ))}
                      </td>
                      <td>
                        <span className={`method-badge ${sale.paymentMethod.replace('/', '')}`}>{sale.paymentMethod}</span>
                      </td>
                      <td className="total-cell">{formatMoney(sale.total)}</td>
                      <td className="profit-cell">{formatMoney(sale.profit)}</td>
                      <td className="actions-cell">
                        <button className="receipt-btn" onClick={() => setShowReceipt(sale)}>
                          🧾
                        </button>
                        <button className="refund-btn" onClick={() => handleRefund(sale.id)}>
                          🔄
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-table-cell">
                        Hech qanday sotuv tranzaksiyasi topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: PRODUCT ADD / EDIT */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{editingProduct ? 'Mahsulotni Tahrirlash' : "Yangi Mahsulot Qo'shish"}</h3>
              <button className="close-modal-btn" onClick={() => setIsProductModalOpen(false)}>
                &times;
              </button>
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
                <button type="button" className="btn-cancel" onClick={() => setIsProductModalOpen(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn-save">
                  {editingProduct ? 'Saqlash' : "Qo'shish"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECEIPT */}
      {showReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceipt(null)}>
          <div className="receipt-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-paper">
              <div className="receipt-header">
                <div className="receipt-logo">SMARTSOTUV</div>
                <p>Manzil: Toshkent shahar, Chilonzor 1-kv</p>
                <p>Tel: +998 90 123 45 67</p>
                <div className="receipt-divider" />
              </div>
              <div className="receipt-details">
                <p>
                  <strong>ID:</strong> {showReceipt.id}
                </p>
                <p>
                  <strong>Sana:</strong> {new Date(showReceipt.date).toLocaleString('uz-UZ')}
                </p>
                <p>
                  <strong>Mijoz:</strong> {showReceipt.customer}
                </p>
                <p>
                  <strong>To'lov:</strong> {showReceipt.paymentMethod}
                </p>
                <div className="receipt-divider" />
              </div>
              <div className="receipt-items">
                <div className="receipt-item-header">
                  <span>Mahsulot</span>
                  <span>Soni x Narx</span>
                  <span>Jami</span>
                </div>
                <div className="receipt-divider solid" />
                {showReceipt.items.map((item, idx) => (
                  <div key={idx} className="receipt-item-row">
                    <span className="item-name">{item.name}</span>
                    <span>
                      {item.quantity} x {formatMoney(item.price)}
                    </span>
                    <span>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="receipt-divider" />
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
              <button className="receipt-print-btn hover-scale" onClick={() => window.print()}>
                🖨️ Chop etish
              </button>
              <button className="receipt-close-btn hover-scale" onClick={() => setShowReceipt(null)}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
