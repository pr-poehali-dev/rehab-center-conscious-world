import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import Navbar from "@/components/Navbar";
import SectionsTop from "@/components/SectionsTop";
import SectionsBottom from "@/components/SectionsBottom";
import PaymentModal, { PaymentItem } from "@/components/PaymentModal";

export default function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState<PaymentItem | null>(null);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openPayment = (item: PaymentItem) => setPaymentItem(item);

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <PaymentModal open={!!paymentItem} onClose={() => setPaymentItem(null)} item={paymentItem} />
      <Navbar onBooking={() => setBookingOpen(true)} />
      <SectionsTop onBooking={() => setBookingOpen(true)} scrollTo={scrollTo} onPayment={openPayment} />
      <SectionsBottom onBooking={() => setBookingOpen(true)} />
    </div>
  );
}
