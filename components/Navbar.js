"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ToastProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isAdmin = Boolean(user && user.role === "admin");
  const showCart = !isAdmin;

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!event.target.closest(".user-menu-wrap")) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const homeSectionHref = (hash) => (pathname === "/" ? hash : "/" + hash);

  async function handleLogout() {
    try {
      await logout();
      setShowLogoutConfirm(false);
      addToast("Logged out successfully.", "success");
    } catch {
      addToast("Unable to log out. Please try again.", "error");
    }
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link className="brand" href="/" aria-label="MediQuick Pharmacy home">
          <span className="brand-mark">MQ</span>
          <span className="brand-text">MediQuick Pharmacy</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <Link className={pathname === "/" ? "active" : ""} href="/">
            Home
          </Link>
          <Link className={pathname.startsWith("/medicines") ? "active" : ""} href="/medicines">
            Medicines
          </Link>
          <a href={homeSectionHref("#about")}>About</a>
          <a href={homeSectionHref("#contact")}>Contact</a>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link className={pathname.startsWith("/admin") ? "active" : ""} href="/admin">
                  Admin
                </Link>
              )}
              <div className="user-menu-wrap">
                <button
                  className="nav-button user-menu-trigger"
                  type="button"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <span className="user-icon" aria-hidden="true">👤</span>
                  <span className="user-name">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="user-menu">
                    <div className="user-menu-profile">
                      <span className="user-menu-avatar" aria-hidden="true">👤</span>
                      <div className="user-menu-details">
                        <span className="user-menu-name">{user.name}</span>
                        <span className="user-menu-email">{user.email}</span>
                        <span className="user-menu-role">{user.role}</span>
                      </div>
                    </div>
                    {!isAdmin && (
                        <button
                          className="user-menu-order-button"
                          type="button"
                          onClick={() => router.push("/orders")}
                          aria-label="Open My Orders"
                        >
                          My Orders
                        </button>
                      )}
                    <button className="user-menu-item logout-trigger" type="button" onClick={() => setShowLogoutConfirm(true)}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            !loading && (
              <Link className={pathname === "/login" ? "active" : ""} href="/login">
                Login
              </Link>
            )
          )}
          {showCart && (
            <Link className={pathname === "/cart" ? "active cart-link" : "cart-link"} href="/cart">
              Cart
              <span className="cart-count">{itemCount}</span>
            </Link>
          )}
        </nav>
      </div>
      {showLogoutConfirm && (
        <div className="logout-modal-backdrop" role="dialog" aria-modal="true">
          <div className="logout-modal">
            <div className="logout-modal-head">
              <span className="logout-modal-title">Logout</span>
              <button className="logout-modal-close" type="button" aria-label="Close" onClick={() => setShowLogoutConfirm(false)}>×</button>
            </div>
            <p className="logout-modal-copy">Are you sure you want to logout?</p>
            <div className="logout-modal-actions">
              <button className="btn btn-secondary btn-small" type="button" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-small" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
