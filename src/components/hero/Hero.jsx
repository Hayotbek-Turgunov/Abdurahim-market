import "./Hero.css";
import heroImg from "../../assets/hero.png";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-left">
          <p className="hero-subtitle">Branding | Image making</p>

          <h1 className="hero-title">
            My awesome
            <br />
            portfolio
          </h1>

          <p className="hero-desc">
            And I made it myself! Yes. In Figma with Anima
          </p>
        </div>

        <div className="hero-right">
          <img src="./Image.png" alt="Hero" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
