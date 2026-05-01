import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  phone: string | null;
  birthDate: string | null;
  passportSeries: string | null;
  passportNumber: string | null;
  passportIssuedBy: string | null;
  passportIssuedDate: string | null;
  address: string | null;
  avatarUrl: string | null;
  favorites: FavoriteSpecialist[];
  donations: Donation[];
  bookings: Booking[];
}

interface Booking {
  id: number;
  service: string;
  date: string | null;
  city: string;
  comment: string;
  status: string;
  createdAt: string;
}

type Tab = "personal" | "bookings" | "favorites" | "donations" | "security";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  // Личные данные
  const [personalForm, setPersonalForm] = useState({
    name: "", phone: "", birthDate: "",
    passportSeries: "", passportNumber: "",
    passportIssuedBy: "", passportIssuedDate: "",
    address: "",
  });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState(false);

  // Аватар
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Пароль
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const token = localStorage.getItem("auth_token");
  const email = localStorage.getItem("auth_email") || "";

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(PROFILE_URL, { headers: { "X-Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { navigate("/login"); return; }
        setProfile(data);
        setPersonalForm({
          name: data.name || "",
          phone: data.phone || "",
          birthDate: data.birthDate || "",
          passportSeries: data.passportSeries || "",
          passportNumber: data.passportNumber || "",
          passportIssuedBy: data.passportIssuedBy || "",
          passportIssuedDate: data.passportIssuedDate || "",
          address: data.address || "",
        });
        setAvatarPreview(data.avatarUrl || null);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingPersonal(true);
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${token}` },
      body: JSON.stringify(personalForm),
    });
    if (profile) setProfile({ ...profile, ...personalForm, name: personalForm.name });
    localStorage.setItem("auth_name", personalForm.name);
    setSavingPersonal(false);
    setPersonalSuccess(true);
    setTimeout(() => setPersonalSuccess(false), 3000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    if (file.size > 5 * 1024 * 1024) { alert("Файл слишком большой (макс. 5 МБ)"); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      setUploadingAvatar(true);
      try {
        const res = await fetch(`${PROFILE_URL}?action=upload-avatar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${token}` },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = await res.json();
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
          if (profile) setProfile({ ...profile, avatarUrl: data.avatarUrl });
        }
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFavorite = async (specialistId: string) => {
    if (!token) return;
    await fetch(`${PROFILE_URL}?action=remove-fav`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${token}` },
      body: JSON.stringify({ specialistId }),
    });
    if (profile) setProfile({ ...profile, favorites: profile.favorites.filter(f => f.specialistId !== specialistId) });
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
    if (pwForm.new.length < 6) { setPwError("Минимум 6 символов"); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}?action=change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: pwForm.old, newPassword: pwForm.new }),
      });
      const data = await res.json();
      if (data.success) { setPwSuccess(true); setPwForm({ old: "", new: "", confirm: "" }); setTimeout(() => setPwSuccess(false), 3000); }
      else setPwError(data.error || "Ошибка");
    } catch { setPwError("Ошибка соединения"); }
    finally { setPwLoading(false); }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "personal", label: "Личные данные", icon: "User" },
    { id: "bookings", label: "Мои записи", icon: "Calendar" },
    { id: "favorites", label: "Избранные", icon: "Heart" },
    { id: "donations", label: "Взносы", icon: "HandCoins" },
    { id: "security", label: "Безопасность", icon: "Lock" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center">
      <p className="font-body text-muted-foreground">Загрузка...</p>
    </div>
  );

  const displayName = personalForm.name || email.split("@")[0];

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Hero */}
      <section className="pt-24 pb-10 px-6 bg-warm-cream flower-of-life-bg border-b border-border">
        <div className="container-max max-w-4xl">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Аватар */}
            <div className="relative flex-shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-sage-light flex items-center justify-center cursor-pointer overflow-hidden border-2 border-border hover:border-sage transition-colors group"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Аватар" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="User" size={32} className="text-sage" />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <Icon name="Camera" size={20} className="text-white" />
                </div>
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl text-deep-slate">{displayName}</h1>
              <p className="font-body text-sm text-muted-foreground mt-0.5">{email}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Нажмите на фото для замены</p>
            </div>

            <button onClick={handleLogout} className="font-body text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5">
              <Icon name="LogOut" size={14} />
              Выйти
            </button>
          </div>
        </div>
      </section>

      {/* Контент */}
      <section className="px-6 pt-8 pb-16">
        <div className="container-max max-w-4xl">
          {/* Табы */}
          <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 font-body text-sm px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "border-sage text-sage" : "border-transparent text-muted-foreground hover:text-deep-slate"
                }`}
              >
                <Icon name={tab.icon} size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Личные данные */}
          {activeTab === "personal" && (
            <form onSubmit={handleSavePersonal} className="space-y-8 max-w-2xl">
              {personalSuccess && (
                <div className="flex items-center gap-3 bg-sage-light border border-sage/20 rounded-2xl px-5 py-4">
                  <Icon name="CheckCircle" size={18} className="text-sage flex-shrink-0" />
                  <p className="font-body text-sm text-sage font-medium">Данные сохранены</p>
                </div>
              )}

              {/* Основные */}
              <div>
                <h3 className="font-display text-lg text-deep-slate mb-4 pb-2 border-b border-border">Основная информация</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Полное имя</Label>
                    <Input className="mt-1 border-warm-tan focus:border-sage" placeholder="Иванов Иван Иванович"
                      value={personalForm.name} onChange={e => setPersonalForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Телефон</Label>
                    <Input className="mt-1 border-warm-tan focus:border-sage" placeholder="+7 (999) 000-00-00"
                      value={personalForm.phone} onChange={e => setPersonalForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Дата рождения</Label>
                    <Input type="date" className="mt-1 border-warm-tan focus:border-sage"
                      value={personalForm.birthDate} onChange={e => setPersonalForm(f => ({ ...f, birthDate: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-body text-sm text-deep-slate">Адрес проживания</Label>
                    <Input className="mt-1 border-warm-tan focus:border-sage" placeholder="Город, улица, дом, квартира"
                      value={personalForm.address} onChange={e => setPersonalForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Паспортные данные */}
              <div>
                <h3 className="font-display text-lg text-deep-slate mb-1 pb-2 border-b border-border">Паспортные данные</h3>
                <p className="font-body text-xs text-muted-foreground mb-4">Данные хранятся в зашифрованном виде и используются только для оформления документов</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Серия паспорта</Label>
                    <Input className="mt-1 border-warm-tan focus:border-sage" placeholder="0000"
                      value={personalForm.passportSeries} onChange={e => setPersonalForm(f => ({ ...f, passportSeries: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Номер паспорта</Label>
                    <Input className="mt-1 border-warm-tan focus:border-sage" placeholder="000000"
                      value={personalForm.passportNumber} onChange={e => setPersonalForm(f => ({ ...f, passportNumber: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Дата выдачи</Label>
                    <Input type="date" className="mt-1 border-warm-tan focus:border-sage"
                      value={personalForm.passportIssuedDate} onChange={e => setPersonalForm(f => ({ ...f, passportIssuedDate: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-body text-sm text-deep-slate">Кем выдан</Label>
                    <Input className="mt-1 border-warm-tan focus:border-sage" placeholder="Отдел МВД России по..."
                      value={personalForm.passportIssuedBy} onChange={e => setPersonalForm(f => ({ ...f, passportIssuedBy: e.target.value }))} />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={savingPersonal} className="bg-sage text-primary-foreground hover:opacity-90 font-body gap-2">
                <Icon name="Save" size={16} />
                {savingPersonal ? "Сохраняем..." : "Сохранить данные"}
              </Button>
            </form>
          )}

          {/* Мои записи */}
          {activeTab === "bookings" && (
            <div>
              {!profile?.bookings.length ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="Calendar" size={24} className="text-muted-foreground" />
                  </div>
                  <p className="font-body text-muted-foreground mb-4">У вас пока нет записей на консультацию</p>
                  <Button onClick={() => setBookingOpen(true)} className="bg-sage text-primary-foreground hover:opacity-90 font-body text-sm gap-2">
                    <Icon name="Plus" size={14} />
                    Записаться на консультацию
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.bookings.map(b => {
                    const statusColor: Record<string, string> = {
                      "Новая": "bg-blue-50 text-blue-600 border-blue-100",
                      "Подтверждена": "bg-sage-light text-sage border-sage/20",
                      "Завершена": "bg-muted text-muted-foreground border-border",
                      "Отменена": "bg-red-50 text-red-500 border-red-100",
                    };
                    return (
                      <div key={b.id} className="bg-white rounded-2xl border border-border p-5">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-display text-lg text-deep-slate">{b.service}</p>
                            {b.date && (
                              <p className="font-body text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <Icon name="Calendar" size={13} />
                                {new Date(b.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            )}
                            {b.city && (
                              <p className="font-body text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <Icon name="MapPin" size={12} />
                                {b.city}
                              </p>
                            )}
                            {b.comment && (
                              <p className="font-body text-xs text-muted-foreground mt-2 italic">«{b.comment}»</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`font-body text-xs px-3 py-1 rounded-full border ${statusColor[b.status] || "bg-muted text-muted-foreground border-border"}`}>
                              {b.status}
                            </span>
                            <p className="font-body text-xs text-muted-foreground">{b.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
                          <Button size="sm" variant="outline" className="border-sage text-sage font-body text-xs">Профиль</Button>
                        </Link>
                        <button onClick={() => handleRemoveFavorite(fav.specialistId)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
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
                  <div className="flex justify-between items-center px-5 py-4 bg-sage-light rounded-2xl border border-sage/20">
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
                    <Label className="font-body text-sm text-deep-slate">Текущий пароль</Label>
                    <Input type="password" className="mt-1 border-warm-tan focus:border-sage" placeholder="Введите текущий пароль"
                      value={pwForm.old} onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Новый пароль</Label>
                    <Input type="password" className="mt-1 border-warm-tan focus:border-sage" placeholder="Минимум 6 символов"
                      value={pwForm.new} onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-deep-slate">Повторите новый пароль</Label>
                    <Input type="password" className="mt-1 border-warm-tan focus:border-sage" placeholder="Повторите пароль"
                      value={pwForm.confirm} onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(""); }} />
                  </div>
                  {pwError && <p className="text-sm text-destructive font-body">{pwError}</p>}
                  <Button type="submit" disabled={pwLoading || !pwForm.old || !pwForm.new || !pwForm.confirm}
                    className="bg-sage text-primary-foreground hover:opacity-90 font-body">
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