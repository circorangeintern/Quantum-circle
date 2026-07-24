import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ href, children, onClick }) {
  const pathname = usePathname();

  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm text-center border p-2 rounded-2xl transition-colors ${
        isActive ? "bg-white text-(--navy-blue)" : "text-(--navtext)"
      }`}
    >
      {children}
    </Link>
  );
}
