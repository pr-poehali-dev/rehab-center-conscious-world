import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import FlowerOfLife from "@/components/FlowerOfLife";
import { SPECIALISTS } from "@/data/specialists";

export default function Specialists() {
  const [bookingOpen, setBookingOpen] = useState(false);

  const sorted = [...SPECIALISTS].sort((a, b) => b.rating - a.rating || b.expYears - a.expYears);

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Hero */}
      <section className="pt-28 pb-14 px-6 bg-warm-cream flower-of-life-bg">
        <div className="container-max text-center">
          <div className="flex justify-center mb-6">
            <FlowerOfLife size={48} />
          </div>
          <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Команда</p>
          <h1 className="font-display text-5xl md:text-6xl text-deep-slate leading-tight mb-4">
            Наши специалисты
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
            Опытные профессионалы, которым можно доверить самое важное — ваше здоровье и благополучие
          </p>
        </div>
      </section>

      {/* Карточки специалистов */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-8">
            {sorted.map((sp, idx) => (
              <Link
                key={sp.id}
                to={`/specialists/${sp.id}`}
                className="group bg-white rounded-3xl border border-border overflow-hidden card-hover flex flex-col sm:flex-row"
              >
                {/* Фото */}
                <div className="sm:w-48 flex-shrink-0 relative">
                  {idx === 0 && (
                    <span className="absolute top-3 left-3 z-10 bg-sage text-primary-foreground text-xs font-body px-2.5 py-1 rounded-full">
                      ★ Топ рейтинг
                    </span>
                  )}
                  <img
                    src={sp.photo}
                    alt={sp.name}
                    className="w-full h-52 sm:h-full object-cover object-top"
                  />
                </div>

                {/* Инфо */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <p className="font-body text-xs text-sage uppercase tracking-wider mb-1">{sp.role}</p>
                    <h3 className="font-display text-2xl text-deep-slate mb-2 group-hover:text-sage transition-colors">
                      {sp.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="font-body text-sm font-medium text-deep-slate">{sp.rating}</span>
                        <span className="font-body text-xs text-muted-foreground">({sp.reviewCount} отз.)</span>
                      </div>
                      <span className="text-border">·</span>
                      <span className="font-body text-xs text-muted-foreground">{sp.exp}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sp.specializations.slice(0, 3).map(s => (
                        <span key={s} className="font-body text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                          {s}
                        </span>
                      ))}
                      {sp.specializations.length > 3 && (
                        <span className="font-body text-xs text-muted-foreground px-1 py-1">
                          +{sp.specializations.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div>
                      <span className="font-body text-xs text-muted-foreground">от </span>
                      <span className="font-display text-xl text-deep-slate">{sp.price.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <span className="font-body text-sm text-sage flex items-center gap-1 group-hover:gap-2 transition-all">
                      Подробнее <Icon name="ArrowRight" size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-sage-light flower-of-life-bg">
        <div className="container-max text-center">
          <h2 className="font-display text-3xl md:text-4xl text-deep-slate mb-4">
            Не знаете, к кому обратиться?
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            Расскажите о вашей ситуации — мы подберём подходящего специалиста бесплатно
          </p>
          <Button
            onClick={() => setBookingOpen(true)}
            className="bg-sage text-primary-foreground hover:opacity-90 font-body px-8 py-3 text-base"
          >
            Помогите подобрать специалиста
          </Button>
        </div>
      </section>
    </div>
  );
}
