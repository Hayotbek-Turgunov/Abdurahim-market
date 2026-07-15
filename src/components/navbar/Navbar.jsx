import "./Navbar.css";

const Navbar = () => {
  return (
    <header>
      <h1>Store</h1>
      <nav>
        <ul>
          <li>
            <Link>Home</Link>
          </li>
          <li>
            <Link>About</Link>
          </li>
          <li>
            <Link>Services</Link>
          </li>
          <li>
            <Link>Contacts</Link>
          </li>
        </ul>
      </nav>
      <div className="btns">
        <button>Sign in</button>
        <button>Sign up</button>
      </div>
    </header>
  );
};

export default Navbar;
