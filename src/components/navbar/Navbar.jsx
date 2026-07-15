import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <h1 className="navbar-logo">Store<span className="dot">.</span></h1>
        
        <nav className="navbar-nav">
          <ul className="navbar-list">
            <li className="navbar-item">
              <a href="#" className="navbar-link">Home</a>
            </li>
            <li className="navbar-item">
              <a href="#about" className="navbar-link">About</a>
            </li>
            <li className="navbar-item">
              <a href="#services" className="navbar-link">Services</a>
            </li>
            <li className="navbar-item">
              <a href="#contacts" className="navbar-link">Contacts</a>
            </li>
          </ul>
        </nav>

        <div className="navbar-actions">
          <button className="btn-signin">Sign in</button>
          <button className="btn-signup">Sign up</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
