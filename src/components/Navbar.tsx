import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "О центре", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Программы", href: "#programs" },
  { label: "Специалисты", href: "#specialists" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Блог", href: "#blog" },
  { label: "Контакты", href: "#contacts" },
];

interface NavbarProps {
  onBooking: () => void;
}

export default function Navbar({ onBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container-max flex items-center justify-between h-16 px-6">
        <a href="#" className="font-display text-xl font-medium text-deep-slate tracking-wide">
          Осознанный <span className="text-sage">МИР</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="nav-link font-body text-sm text-muted-foreground hover:text-deep-slate transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            onClick={onBooking}
            className="hidden md:inline-flex bg-sage text-primary-foreground hover:opacity-90 font-body text-sm px-5"
          >
            Записаться
          </Button>
          <button
            className="md:hidden p-2 text-deep-slate"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border px-6 py-4 flex flex-col gap-4 animate-fade-in">
          {NAV_LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-left font-body text-sm text-deep-slate py-1"
            >
              {link.label}
            </button>
          ))}
          <Button
            onClick={() => { onBooking(); setMobileMenuOpen(false); }}
            className="bg-sage text-primary-foreground hover:opacity-90 font-body text-sm w-full"
          >
            Записаться
          </Button>
        </div>
      )}
    </header>
  );
}
