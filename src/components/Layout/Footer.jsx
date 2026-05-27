import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/ABSALogo.png";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <img src={logo} alt="ABSA Logo" className="logo-footer" />
          <h4>NextGen Wealth Studio</h4>
          <p>Helping You Build Your First 5 Years of Wealth.</p>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {year} ABSA Group Limited</p>
          <div className="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
