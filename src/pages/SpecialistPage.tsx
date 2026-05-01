import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import { SPECIALISTS } from "@/data/specialists";

const REVIEWS_URL = "https://functions.poehali.dev/95ecc764-d099-486b-a48c-dc8639786f3b";

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-2xl transition-colors ${onChange ? "cursor-pointer" : "cursor-default"} ${
            star <= (hovered || value) ? "text-amber-400" : "text-muted/30"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const PROFILE_URL = "https://functions.poehali.dev/4f103804-ef0e-4159-890e-6b42228de37d";

export default function SpecialistPage() {
  const { id } = useParams<{ id: string }>();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });
  const [formStep, setFormStep] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${REVIEWS_URL}?section=reviews&specialist_id=${id}`);
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating);
        setReviewCount(data.count || 0);
      } catch { /* silent */ }
    };
    load();
  }, [id]);

  const sp = SPECIALISTS.find(s => s.id === id);
  if (!sp) return <Navigate to="/specialists" replace />;

  const otherSpecialists = SPECIALISTS.filter(s => s.id !== id).slice(0, 2);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${REVIEWS_URL}?section=reviews&specialist_id=${sp.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating);
      setReviewCount(data.count || 0);
    } catch { /* silent */ }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep("loading");
    setFormError("");
    try {
      const res = await fetch(`${REVIEWS_URL}?section=reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistId: sp.id,
          authorName: form.name,
          rating: form.rating,
          text: form.text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormStep("success");
        setForm({ name: "", rating: 5, text: "" });
        fetchReviews();
      } else {
        setFormError(data.error || "Ошибка");
        setFormStep("error");
      }
    } catch {
      setFormError("Ошибка соединения");
      setFormStep("error");
    }
  };

  const displayRating = avgRating ?? sp.rating;
  const displayCount = reviewCount;

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Хлебные крошки */}
      <div className="pt-20 border-b border-border bg-white">
        <div className="container-max py-4 flex items-center gap-2 text-sm font-body text-muted-foreground px-6">
          <Link to="/" className="hover:text-sage transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/specialists" className="hover:text-sage transition-colors">Специалисты</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-deep-slate">{sp.name}</span>
        </div>
      </div>

      {/* Профиль */}
      <section className="py-12 px-6 bg-warm-cream flower-of-life-bg">
        <div className="container-max">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Фото */}
            <div className="flex-shrink-0">
              <img
                src={sp.photo}
                alt={sp.name}
                className="w-56 h-64 md:w-64 md:h-72 object-cover object-top rounded-3xl border-4 border-white shadow-lg"
              />
            </div>

            {/* Основная инфо */}
            <div className="flex-1">
              <span className="font-body text-xs text-sage uppercase tracking-wider">{sp.role}</span>
              <h1 className="font-display text-4xl md:text-5xl text-deep-slate mt-1 mb-3">{sp.name}</h1>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(displayRating)} />
                  <span className="font-body font-semibold text-deep-slate">{displayRating.toFixed(1)}</span>
                  <span className="font-body text-sm text-muted-foreground">({displayCount} отзывов)</span>
                </div>
                <span className="font-body text-sm text-muted-foreground border-l border-border pl-4">{sp.exp}</span>
              </div>

              <p className="font-body text-muted-foreground leading-relaxed mb-6 max-w-xl">{sp.about}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {sp.specializations.map(s => (
                  <span key={s} className="font-body text-xs bg-white border border-border text-muted-foreground rounded-full px-3 py-1.5">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={() => setBookingOpen(true)}
                  className="bg-sage text-primary-foreground hover:opacity-90 font-body gap-2 px-6"
                >
                  <Icon name="Calendar" size={16} />
                  Записаться — от {sp.price.toLocaleString("ru-RU")} ₽
                </Button>
                {localStorage.getItem("auth_token") ? (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setFavLoading(true);
                      const action = isFav ? "remove-fav" : "add-fav";
                      await fetch(`${PROFILE_URL}?action=${action}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${localStorage.getItem("auth_token")}` },
                        body: JSON.stringify({ specialistId: sp.id }),
                      });
                      setIsFav(!isFav);
                      setFavLoading(false);
                    }}
                    disabled={favLoading}
                    className={`font-body gap-2 border-sage ${isFav ? "bg-sage-light text-sage" : "text-sage hover:bg-sage-light"}`}
                  >
                    <Icon name="Heart" size={15} className={isFav ? "fill-sage" : ""} />
                    {isFav ? "В избранном" : "В избранное"}
                  </Button>
                ) : (
                  <Link to="/login" className="font-body text-sm text-muted-foreground hover:text-sage transition-colors flex items-center gap-1.5">
                    <Icon name="Heart" size={14} />
                    Добавить в избранное
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Образование и методы */}
      <section className="py-12 px-6 bg-white">
        <div className="container-max grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-2xl text-deep-slate mb-5 flex items-center gap-2">
              <Icon name="GraduationCap" size={22} className="text-sage" /> Образование
            </h2>
            <ul className="space-y-3">
              {sp.education.map((e, i) => (
                <li key={i} className="flex items-start gap-3 font-body text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl text-deep-slate mb-5 flex items-center gap-2">
              <Icon name="Sparkles" size={22} className="text-sage" /> Методы работы
            </h2>
            <div className="flex flex-wrap gap-2">
              {sp.methods.map(m => (
                <span key={m} className="font-body text-sm bg-sage-light text-sage rounded-xl px-4 py-2">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section className="py-12 px-6 bg-warm-cream flower-of-life-bg">
        <div className="container-max max-w-3xl">
          <h2 className="font-display text-3xl text-deep-slate mb-8">
            Отзывы {displayCount > 0 && <span className="text-muted-foreground text-2xl">({displayCount})</span>}
          </h2>

          {reviews.length === 0 ? (
            <p className="font-body text-muted-foreground italic mb-10">Пока отзывов нет — будьте первым!</p>
          ) : (
            <div className="space-y-4 mb-10">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body font-medium text-deep-slate">{r.author}</p>
                    <span className="font-body text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-lg ${s <= r.rating ? "text-amber-400" : "text-muted/20"}`}>★</span>
                    ))}
                  </div>
                  <p className="font-body text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Форма отзыва */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-display text-xl text-deep-slate mb-5">Оставить отзыв</h3>

            {formStep === "success" ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🌿</div>
                <p className="font-body text-deep-slate font-medium mb-1">Спасибо за отзыв!</p>
                <p className="font-body text-sm text-muted-foreground">Он уже опубликован</p>
                <Button
                  variant="ghost"
                  className="mt-4 text-sage font-body"
                  onClick={() => setFormStep("idle")}
                >
                  Написать ещё
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label className="font-body text-sm text-deep-slate">Ваше имя</Label>
                  <Input
                    className="mt-1 border-warm-tan focus:border-sage"
                    placeholder="Как вас зовут?"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="font-body text-sm text-deep-slate mb-2 block">Оценка</Label>
                  <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
                </div>
                <div>
                  <Label className="font-body text-sm text-deep-slate">Ваш отзыв</Label>
                  <Textarea
                    className="mt-1 border-warm-tan focus:border-sage resize-none"
                    placeholder="Поделитесь опытом работы со специалистом..."
                    rows={4}
                    value={form.text}
                    onChange={e => setForm({ ...form, text: e.target.value })}
                    required
                    minLength={10}
                  />
                </div>
                {formStep === "error" && (
                  <p className="text-sm text-destructive font-body">{formError}</p>
                )}
                <Button
                  type="submit"
                  disabled={formStep === "loading"}
                  className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body"
                >
                  {formStep === "loading" ? "Отправляем..." : "Опубликовать отзыв"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Другие специалисты */}
      {otherSpecialists.length > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="container-max">
            <h2 className="font-display text-3xl text-deep-slate mb-8">Другие специалисты</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otherSpecialists.map(s => (
                <Link
                  key={s.id}
                  to={`/specialists/${s.id}`}
                  className="group flex items-center gap-4 bg-warm-cream rounded-2xl p-5 border border-border card-hover"
                >
                  <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-2xl object-cover object-top flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-body text-xs text-sage">{s.role}</p>
                    <p className="font-display text-lg text-deep-slate group-hover:text-sage transition-colors">{s.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="font-body text-xs text-muted-foreground">{s.rating} · {s.exp}</span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-sage transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}