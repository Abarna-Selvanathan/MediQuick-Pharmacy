"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const homeSectionHref = (hash) => (pathname === "/" ? hash : `/${hash}`);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link className="brand" href="/">
          MediQuick Pharmacy
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <Link className={pathname === "/" ? "active" : ""} href="/">
            Home
          </Link>
          <Link
            className={pathname.startsWith("/medicines") ? "active" : ""}
            href="/medicines"
          >
            Medicines
          </Link>
          <a href={homeSectionHref("#about")}>About</a>
          <a href={homeSectionHref("#contact")}>Contact</a>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  className={pathname.startsWith("/admin") ? "active" : ""}
                  href="/admin"
                >
                  Admin Dashboard
                </Link>
              )}
              <span className="nav-button">{user.name}</span>
              <button className="nav-button" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            !loading && (
              <Link className={pathname === "/login" ? "active" : ""} href="/login">
                Login
              </Link>
            )
          )}
          <Link className={pathname === "/cart" ? "active" : ""} href="/cart">
            Cart
            <span className="cart-count">{itemCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
