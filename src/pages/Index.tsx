import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import Navbar from "@/components/Navbar";
import SectionsTop from "@/components/SectionsTop";
import SectionsBottom from "@/components/SectionsBottom";

export default function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />
      <SectionsTop onBooking={() => setBookingOpen(true)} scrollTo={scrollTo} />
      <SectionsBottom onBooking={() => setBookingOpen(true)} />
    </div>
  );
}
