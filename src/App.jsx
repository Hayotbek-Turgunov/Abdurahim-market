import About from "./components/about/About";
import Banner from "./components/banner/Banner";
import Footer from "./components/footer/Footer";
import Hero from "./components/hero/Hero";
import Navbar from "./components/navbar/Navbar";
import Product from "./components/product/Product";
import ProductDiscount from "./components/productDiscount/ProductDiscount";
import Team from "./components/team/Team";

const App = () => {
  return (
    <div>
      <Navbar />
      <Banner />
      <Hero />
      <About />
      <Product />
      <ProductDiscount />
      <Team />
      <Footer />
    </div>
  );
};

export default App;
