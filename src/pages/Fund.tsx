import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import FlowerOfLife from "@/components/FlowerOfLife";

const FUND_URL = "https://functions.poehali.dev/95ecc764-d099-486b-a48c-dc8639786f3b?section=fund";

interface FundDonor {
  id: string;
  name: string;
  title: string;
  bio: string;
  activity: string;
  photo: string;
  totalDonated: number;
  donationsCount: number;
  rank: number;
}

const medals = ["🥇", "🥈", "🥉"];

function pluralDonations(n: number) {
  if (n === 1) return "взнос";
  if (n >= 2 && n <= 4) return "взноса";
  return "взносов";
}

export default function Fund() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [donors, setDonors] = useState<FundDonor[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem("auth_token");
  const totalFund = donors.reduce((sum, d) => sum + d.totalDonated, 0);

  const fetchDonors = async () => {
    try {
      const res = await fetch(FUND_URL);
      const data = await res.json();
      setDonors(data.donors || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonors(); }, []);

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-warm-cream flower-of-life-bg">
        <div className="container-max text-center">
          <div className="flex justify-center mb-6">
            <FlowerOfLife size={48} />
          </div>
          <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Благотворительность</p>
          <h1 className="font-display text-5xl md:text-6xl text-deep-slate leading-tight mb-5">
            Благотворительный фонд
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Люди, которые верят в важность нашей работы и делают её возможной. Рейтинг формируется по сумме внесённых пожертвований.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            {totalFund > 0 && (
              <div className="inline-flex items-center gap-3 bg-white border border-border rounded-2xl px-8 py-4 shadow-sm">
                <Icon name="Heart" size={20} className="text-sage" />
                <div className="text-left">
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Всего собрано</p>
                  <p className="font-display text-2xl text-deep-slate">{totalFund.toLocaleString("ru-RU")} ₽</p>
                </div>
              </div>
            )}
            {isLoggedIn ? (
              <Link to="/profile?tab=donations">
                <Button className="bg-sage text-primary-foreground hover:opacity-90 font-body gap-2 px-8 py-5 text-base">
                  <Icon name="Heart" size={18} />
                  Сделать взнос
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="border-sage text-sage hover:bg-sage hover:text-primary-foreground font-body gap-2 px-8 py-5 text-base">
                  <Icon name="LogIn" size={16} />
                  Войти, чтобы внести взнос
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Рейтинг */}
      <section className="section-padding bg-white">
        <div className="container-max max-w-4xl">

          {loading && (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground">Загрузка...</p>
            </div>
          )}

          {!loading && donors.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="Heart" size={24} className="text-muted-foreground" />
              </div>
              <p className="font-body text-muted-foreground mb-2">Пока никто не внёс пожертвований</p>
              <p className="font-body text-sm text-muted-foreground">Станьте первым участником рейтинга!</p>
            </div>
          )}

          <div className="space-y-4">
            {donors.map((donor) => (
              <div key={donor.id} className="bg-white border border-border rounded-2xl p-5 md:p-6 flex items-center gap-5">
                {/* Ранг + аватар */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-sage-light overflow-hidden flex items-center justify-center">
                    {donor.photo ? (
                      <img src={donor.photo} alt={donor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="User" size={28} className="text-sage" />
                    )}
                  </div>
                  {donor.rank <= 3 ? (
                    <span className="absolute -top-2 -left-2 text-xl drop-shadow">{medals[donor.rank - 1]}</span>
                  ) : (
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-muted rounded-full flex items-center justify-center font-body text-xs text-muted-foreground font-semibold border border-border">
                      {donor.rank}
                    </span>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl text-deep-slate leading-tight">{donor.name}</h3>
                  <p className="font-body text-xs text-sage mt-0.5">{donor.title}</p>
                  {totalFund > 0 && (
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden max-w-xs">
                      <div className="h-full bg-sage rounded-full" style={{ width: `${Math.min(100, (donor.totalDonated / totalFund) * 100)}%` }} />
                    </div>
                  )}
                </div>

                {/* Сумма */}
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-2xl text-deep-slate">{donor.totalDonated.toLocaleString("ru-RU")} ₽</p>
                  <p className="font-body text-xs text-muted-foreground">{donor.donationsCount} {pluralDonations(donor.donationsCount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* О фонде */}
      <section className="section-padding bg-sage-light flower-of-life-bg">
        <div className="container-max text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl text-deep-slate mb-4">Как работает фонд</h2>
          <p className="font-body text-muted-foreground mb-10 leading-relaxed">
            Все собранные средства направляются на финансирование бесплатных программ помощи, обучение специалистов и поддержку людей, которые не могут позволить себе лечение.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: "Users", title: "Бесплатные программы", desc: "Для малоимущих семей и одиноких людей в кризисной ситуации" },
              { icon: "GraduationCap", title: "Обучение специалистов", desc: "Повышение квалификации психологов в регионах" },
              { icon: "Heart", title: "Поддержка в ремиссии", desc: "Групповые встречи и онлайн-сопровождение на пути к трезвости" },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-border">
                <div className="w-10 h-10 bg-sage-light rounded-xl flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-sage" />
                </div>
                <h3 className="font-display text-lg text-deep-slate mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/">
              <Button variant="outline" className="border-sage text-sage hover:bg-sage hover:text-primary-foreground font-body gap-2">
                <Icon name="ArrowLeft" size={14} />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}