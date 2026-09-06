import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>MediQuick Pharmacy</h3>
          <p>
            Convenient online access to medicines and pharmacy products.
          </p>
        </div>
        <div>
          <h4>Navigation</h4>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/medicines">Medicines</Link>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/prescription">Prescription Upload</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Email: support@mediquick.pharmacy</p>
          <p>Phone: +94 11 234 5678</p>
          <p>Colombo, Sri Lanka</p>
          <p>Hours: Monday to Saturday, 9:00 to 18:00</p>
        </div>
      </div>
      <div className="container">
        <p>Copyright {new Date().getFullYear()} MediQuick Pharmacy. All rights reserved.</p>
      </div>
    </footer>
  );
}
