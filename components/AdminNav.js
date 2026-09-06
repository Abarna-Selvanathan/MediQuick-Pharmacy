import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/prescriptions", label: "Prescriptions" },
  { href: "/admin/inquiries", label: "Inquiries" }
];

export default function AdminNav({ current }) {
  return (
    <nav className="admin-nav">
      {links.map((link) => (
        <Link key={link.href} className={current === link.href ? "active" : ""} href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
