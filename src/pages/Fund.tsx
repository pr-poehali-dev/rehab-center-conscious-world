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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [donating, setDonating] = useState<{ id: string; amount: string } | null>(null);
  const [donateStep, setDonateStep] = useState<"idle" | "loading" | "success">("idle");

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

  const handleDonate = async (donorId: string) => {
    const amount = parseFloat(donating?.amount || "0");
    if (!amount || amount <= 0) return;
    setDonateStep("loading");
    try {
      await fetch(FUND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId, amount }),
      });
      setDonateStep("success");
      fetchDonors();
      setTimeout(() => { setDonating(null); setDonateStep("idle"); }, 2500);
    } catch { setDonateStep("idle"); }
  };

  const totalFund = donors.reduce((sum, d) => sum + d.totalDonated, 0);

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

          {/* Суммарный счётчик */}
          {totalFund > 0 && (
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-2xl px-8 py-4 shadow-sm">
              <Icon name="Heart" size={20} className="text-sage" />
              <div className="text-left">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Всего собрано</p>
                <p className="font-display text-2xl text-deep-slate">{totalFund.toLocaleString("ru-RU")} ₽</p>
              </div>
            </div>
          )}
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
              <p className="font-body text-muted-foreground">Данные фонда временно недоступны</p>
            </div>
          )}

          <div className="space-y-5">
            {donors.map((donor) => (
              <div
                key={donor.id}
                className="bg-white border border-border rounded-3xl overflow-hidden card-hover transition-all"
              >
                <div className="flex items-start gap-6 p-6 md:p-8">
                  {/* Ранг + фото */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={donor.photo}
                      alt={donor.name}
                      className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover object-top"
                    />
                    {donor.rank <= 3 ? (
                      <span className="absolute -top-2 -left-2 text-2xl drop-shadow">{medals[donor.rank - 1]}</span>
                    ) : (
                      <span className="absolute -top-2 -left-2 w-7 h-7 bg-muted rounded-full flex items-center justify-center font-body text-xs text-muted-foreground font-semibold border border-border">
                        {donor.rank}
                      </span>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-display text-2xl text-deep-slate leading-tight">{donor.name}</h3>
                        <p className="font-body text-sm text-sage mt-0.5">{donor.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-2xl md:text-3xl text-deep-slate">
                          {donor.totalDonated > 0
                            ? donor.totalDonated.toLocaleString("ru-RU") + " ₽"
                            : <span className="text-muted-foreground text-xl">—</span>}
                        </p>
                        {donor.donationsCount > 0 && (
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            {donor.donationsCount} {pluralDonations(donor.donationsCount)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Прогресс-бар */}
                    {totalFund > 0 && donor.totalDonated > 0 && (
                      <div className="mt-3 mb-3">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sage rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (donor.totalDonated / totalFund) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-2">{donor.bio}</p>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="font-body text-xs bg-sage-light text-sage rounded-full px-3 py-1.5">
                        {donor.activity}
                      </span>
                      <button
                        onClick={() => setExpanded(expanded === donor.id ? null : donor.id)}
                        className="font-body text-xs text-muted-foreground hover:text-sage transition-colors flex items-center gap-1"
                      >
                        {expanded === donor.id ? "Скрыть" : "Подробнее"}
                        <Icon name={expanded === donor.id ? "ChevronUp" : "ChevronDown"} size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Раскрытый блок */}
                {expanded === donor.id && (
                  <div className="px-6 md:px-8 pb-6 border-t border-border pt-5 bg-warm-cream">
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{donor.bio}</p>
                  </div>
                )}
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