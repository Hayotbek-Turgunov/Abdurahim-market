import "./Product.css";

const products = [
  {
    id: 1,
    name: "iPhone 16 Pro",
    price: "12 999 000",
    oldPrice: "14 500 000",
    image: "https://pngimg.com/d/iphone_16_PNG37.png",
    category: "Smartfon",
  },
  {
    id: 2,
    name: "Samsung Galaxy S25",
    price: "9 499 000",
    oldPrice: "10 999 000",
    image: "https://pngimg.com/d/samsung_PNG31.png",
    category: "Smartfon",
  },
  {
    id: 3,
    name: "MacBook Air M3",
    price: "18 999 000",
    oldPrice: "21 000 000",
    image: "https://pngimg.com/d/macbook_PNG52.png",
    category: "Noutbuk",
  },
  {
    id: 4,
    name: "AirPods Pro 2",
    price: "2 799 000",
    oldPrice: "3 200 000",
    image: "https://pngimg.com/d/airpods_PNG23.png",
    category: "Audio",
  },
  {
    id: 5,
    name: "iPad Air M2",
    price: "8 499 000",
    oldPrice: "9 500 000",
    image: "https://pngimg.com/d/ipad_PNG35.png",
    category: "Planshet",
  },
  {
    id: 6,
    name: "Apple Watch Ultra 2",
    price: "5 999 000",
    oldPrice: "6 800 000",
    image: "https://pngimg.com/d/apple_PNG25.png",
    category: "Soat",
  },
  {
    id: 7,
    name: "PlayStation 5",
    price: "7 499 000",
    oldPrice: "8 500 000",
    image: "https://pngimg.com/d/playstation_PNG73.png",
    category: "O'yin",
  },
  {
    id: 8,
    name: "Samsung 55\" QLED TV",
    price: "6 999 000",
    oldPrice: "8 000 000",
    image: "https://pngimg.com/d/tv_PNG33.png",
    category: "Televizor",
  },
  {
    id: 9,
    name: "Logitech MX Master 3S",
    price: "899 000",
    oldPrice: "1 100 000",
    image: "https://pngimg.com/d/mouse_PNG64.png",
    category: "Aksessuar",
  },
  {
    id: 10,
    name: "JBL Charge 5",
    price: "1 499 000",
    oldPrice: "1 800 000",
    image: "https://pngimg.com/d/speaker_PNG36.png",
    category: "Audio",
  },
];

const Product = () => {
  return (
    <section className="product-section">
      <div className="product-container">
        <h2 className="product-title">Mahsulotlar</h2>
        <div className="product-grid">
          {products.map((item) => (
            <div className="product-card" key={item.id}>
              <span className="product-badge">{item.category}</span>
              <img className="product-image" src={item.image} alt={item.name} />
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                <div className="product-price">
                  <span className="product-current">{item.price} so'm</span>
                  <span className="product-old">{item.oldPrice} so'm</span>
                </div>
                <button className="product-btn">Savatga qo'shish</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;
