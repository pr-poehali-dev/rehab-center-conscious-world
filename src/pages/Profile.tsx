import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";

const PROFILE_URL = "https://functions.poehali.dev/4f103804-ef0e-4159-890e-6b42228de37d";
const AUTH_URL = "https://functions.poehali.dev/787350a7-d77a-48bb-99f6-c77466ca7470";

interface FavoriteSpecialist {
  specialistId: string;
  name: string;
  role: string;
  photo: string;
  addedAt: string;
}

interface Donation {
  amount: number;
  date: string;
}

interface ProfileData {
  userId: number;
  email: string;
  name: string | null;
  favorites: FavoriteSpecialist[];
  donations: Donation[];
  bookings: unknown[];
}

type Tab = "favorites" | "donations" | "security";

export default function Profile() {
  const navigate = useNavigate();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const token = localStorage.getItem("auth_token");
  const email = localStorage.getItem("auth_email") || "";

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(PROFILE_URL, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { navigate("/login"); return; }
        setProfile(data);
        setNameInput(data.name || "");
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim() || !token) return;
    setSavingName(true);
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ name: nameInput }),
    });
    if (profile) setProfile({ ...profile, name: nameInput });
    localStorage.setItem("auth_name", nameInput);
    setEditName(false);
    setSavingName(false);
  };

  const handleRemoveFavorite = async (specialistId: string) => {
    if (!token) return;
    await fetch(`${PROFILE_URL}?action=remove-fav`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ specialistId }),
    });
    if (profile) {
      setProfile({ ...profile, favorites: profile.favorites.filter(f => f.specialistId !== specialistId) });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_name");
    navigate("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.new !== pwForm.confirm) { setPwError("Пароли не совпадают"); return; }
    if (pwForm.new.length < 6) { setPwError("Новый пароль должен быть не короче 6 символов"); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}?action=change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: pwForm.old, newPassword: pwForm.new }),
      });
      const data = await res.json();
      if (data.success) {
        setPwSuccess(true);
        setPwForm({ old: "", new: "", confirm: "" });
        setTimeout(() => setPwSuccess(false), 3000);
      } else {
        setPwError(data.error || "Ошибка");
      }
    } catch { setPwError("Ошибка соединения"); }
    finally { setPwLoading(false); }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "favorites", label: "Избранные специалисты", icon: "Heart" },
    { id: "donations", label: "История взносов", icon: "HandCoins" },
    { id: "security", label: "Безопасность", icon: "Lock" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <p className="font-body text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const displayName = profile?.name || email.split("@")[0];

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Hero */}
      <section className="pt-24 pb-10 px-6 bg-warm-cream flower-of-life-bg border-b border-border">
        <div className="container-max max-w-3xl">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={28} className="text-sage" />
            </div>
            <div className="flex-1 min-w-0">
              {editName ? (
                <div className="flex items-center gap-3">
                  <Input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="border-warm-tan focus:border-sage max-w-[220px] font-display text-lg"
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && handleSaveName()}
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={savingName} className="bg-sage text-primary-foreground font-body text-sm">
                    {savingName ? "..." : "Сохранить"}
                  </Button>
                  <button onClick={() => setEditName(false)} className="font-body text-xs text-muted-foreground hover:text-deep-slate">
                    Отмена
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl text-deep-slate">{displayName}</h1>
                  <button onClick={() => setEditName(true)} className="text-muted-foreground hover:text-sage transition-colors">
                    <Icon name="Pencil" size={14} />
                  </button>
                </div>
              )}
              <p className="font-body text-sm text-muted-foreground mt-0.5">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="font-body text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
            >
              <Icon name="LogOut" size={14} />
              Выйти
            </button>
          </div>
        </div>
      </section>

      {/* Табы */}
      <section className="px-6 pt-8 pb-16">
        <div className="container-max max-w-3xl">
          <div className="flex gap-2 mb-8 border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 font-body text-sm px-4 py-3 border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-sage text-sage"
                    : "border-transparent text-muted-foreground hover:text-deep-slate"
                }`}
              >
                <Icon name={tab.icon} size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Избранные */}
          {activeTab === "favorites" && (
            <div>
              {!profile?.favorites.length ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="Heart" size={24} className="text-muted-foreground" />
                  </div>
                  <p className="font-body text-muted-foreground mb-4">Вы ещё не добавили специалистов в избранное</p>
                  <Link to="/specialists">
                    <Button variant="outline" className="border-sage text-sage hover:bg-sage hover:text-primary-foreground font-body text-sm gap-2">
                      <Icon name="Users" size={14} />
                      Посмотреть специалистов
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.favorites.map(fav => (
                    <div key={fav.specialistId} className="flex items-center gap-4 bg-white rounded-2xl border border-border p-4">
                      <img src={fav.photo} alt={fav.name} className="w-14 h-14 rounded-xl object-cover object-top flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg text-deep-slate leading-tight">{fav.name}</p>
                        <p className="font-body text-xs text-sage">{fav.role}</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">Добавлен {fav.addedAt}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/specialists/${fav.specialistId}`}>
                          <Button size="sm" variant="outline" className="border-sage text-sage font-body text-xs">
                            Профиль
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleRemoveFavorite(fav.specialistId)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Пожертвования */}
          {activeTab === "donations" && (
            <div>
              {!profile?.donations.length ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="HandCoins" size={24} className="text-muted-foreground" />
                  </div>
                  <p className="font-body text-muted-foreground mb-4">История взносов пуста</p>
                  <Link to="/fund">
                    <Button variant="outline" className="border-sage text-sage hover:bg-sage hover:text-primary-foreground font-body text-sm gap-2">
                      <Icon name="Heart" size={14} />
                      Перейти в фонд
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.donations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-2xl border border-border px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sage-light rounded-xl flex items-center justify-center">
                          <Icon name="Heart" size={14} className="text-sage" />
                        </div>
                        <p className="font-body text-sm text-muted-foreground">{d.date}</p>
                      </div>
                      <p className="font-display text-xl text-deep-slate">+{d.amount.toLocaleString("ru-RU")} ₽</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-5 py-4 bg-sage-light rounded-2xl border border-sage/20 mt-2">
                    <p className="font-body text-sm text-sage font-medium">Итого внесено</p>
                    <p className="font-display text-2xl text-deep-slate">
                      {profile.donations.reduce((s, d) => s + d.amount, 0).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Безопасность */}
          {activeTab === "security" && (
            <div className="max-w-md">
              <h3 className="font-display text-xl text-deep-slate mb-6">Смена пароля</h3>
              {pwSuccess ? (
                <div className="flex items-center gap-3 bg-sage-light border border-sage/20 rounded-2xl px-5 py-4">
                  <Icon name="CheckCircle" size={18} className="text-sage flex-shrink-0" />
                  <p className="font-body text-sm text-sage font-medium">Пароль успешно изменён</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="font-body text-sm text-deep-slate block mb-1">Текущий пароль</label>
                    <Input
                      type="password"
                      className="border-warm-tan focus:border-sage"
                      placeholder="Введите текущий пароль"
                      value={pwForm.old}
                      onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-deep-slate block mb-1">Новый пароль</label>
                    <Input
                      type="password"
                      className="border-warm-tan focus:border-sage"
                      placeholder="Минимум 6 символов"
                      value={pwForm.new}
                      onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-deep-slate block mb-1">Повторите новый пароль</label>
                    <Input
                      type="password"
                      className="border-warm-tan focus:border-sage"
                      placeholder="Повторите пароль"
                      value={pwForm.confirm}
                      onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(""); }}
                    />
                  </div>
                  {pwError && <p className="text-sm text-destructive font-body">{pwError}</p>}
                  <Button
                    type="submit"
                    disabled={pwLoading || !pwForm.old || !pwForm.new || !pwForm.confirm}
                    className="bg-sage text-primary-foreground hover:opacity-90 font-body"
                  >
                    {pwLoading ? "Сохраняем..." : "Изменить пароль"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}