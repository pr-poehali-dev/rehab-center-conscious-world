import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/24adc93f-5089-4035-9898-6d7a14a440e8.jpg";

const NAV_LINKS = [
  { label: "О центре", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Программы", href: "#programs" },
  { label: "Специалисты", href: "#specialists" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Блог", href: "#blog" },
  { label: "Контакты", href: "#contacts" },
];

const SERVICES = [
  { icon: "Brain", title: "Психотерапия", desc: "Индивидуальная работа с опытным психотерапевтом. Проработка травм, тревоги, депрессии." },
  { icon: "Heart", title: "Реабилитация", desc: "Комплексные программы восстановления после зависимостей и психологических кризисов." },
  { icon: "Users", title: "Групповая терапия", desc: "Поддерживающие группы под руководством специалиста. Безопасное пространство для роста." },
  { icon: "Leaf", title: "Телесные практики", desc: "Йога, дыхательные техники и соматическая терапия для восстановления связи с телом." },
  { icon: "Palette", title: "Арт-терапия", desc: "Творческое самовыражение как путь к осознанности и внутренней гармонии." },
  { icon: "Shield", title: "Семейная терапия", desc: "Восстановление отношений в семье, улучшение коммуникации и взаимопонимания." },
];

const PROGRAMS = [
  {
    tag: "28 дней",
    title: "«Новое начало»",
    desc: "Интенсивная стационарная программа для тех, кто готов к глубоким переменам. Комплексный подход: психотерапия, групповая работа, телесные практики.",
    price: "от 85 000 ₽",
    color: "bg-sage-light",
  },
  {
    tag: "3 месяца",
    title: "«Путь к себе»",
    desc: "Амбулаторная программа долгосрочной поддержки. Еженедельные сессии, домашние практики и постоянное сопровождение куратора.",
    price: "от 24 000 ₽/мес",
    color: "bg-accent",
  },
  {
    tag: "7 дней",
    title: "«Перезагрузка»",
    desc: "Выездная программа в загородном комплексе. Отдых от городского стресса, медитации, природная терапия и индивидуальные сессии.",
    price: "от 65 000 ₽",
    color: "bg-warm-cream",
  },
];

const SPECIALISTS = [
  { name: "Елена Михайлова", role: "Психотерапевт, КПТ", exp: "14 лет опыта", emoji: "👩‍⚕️" },
  { name: "Андрей Соколов", role: "Нарколог-психиатр", exp: "18 лет опыта", emoji: "👨‍⚕️" },
  { name: "Ольга Петрова", role: "Гештальт-терапевт", exp: "11 лет опыта", emoji: "👩‍💼" },
  { name: "Дмитрий Лебедев", role: "Семейный психолог", exp: "9 лет опыта", emoji: "👨‍💼" },
];

const REVIEWS = [
  {
    name: "Анастасия К.",
    text: "После трёх месяцев работы с психотерапевтом я наконец почувствовала почву под ногами. Центр — это место, где тебя слышат и помогают без осуждения.",
    program: "Программа «Путь к себе»",
    rating: 5,
  },
  {
    name: "Михаил Р.",
    text: "Прошёл стационарную программу. Поначалу было тяжело, но команда специалистов поддерживала на каждом шагу. Теперь жизнь приобрела новый смысл.",
    program: "Программа «Новое начало»",
    rating: 5,
  },
  {
    name: "Светлана В.",
    text: "Выездная «Перезагрузка» стала для меня настоящим открытием. Природа, тишина и мудрые специалисты — именно то, что нужно уставшей душе.",
    program: "Программа «Перезагрузка»",
    rating: 5,
  },
];

const BLOG_POSTS = [
  { tag: "Психология", title: "Как распознать эмоциональное выгорание и что с ним делать", date: "18 апреля 2026" },
  { tag: "Практики", title: "5 дыхательных упражнений для снижения тревоги прямо сейчас", date: "10 апреля 2026" },
  { tag: "Семья", title: "Созависимость: как выйти из токсичных отношений с любовью", date: "2 апреля 2026" },
];

function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", service: "", date: "", comment: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-deep-slate font-normal">
            {sent ? "Заявка принята" : "Запись на консультацию"}
          </DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-muted-foreground font-body text-lg mb-2">Мы свяжемся с вами в течение 2 часов</p>
            <p className="text-soft-stone font-body text-sm">Наш специалист подберёт удобное время и ответит на все вопросы</p>
            <Button className="mt-6 bg-sage text-primary-foreground hover:opacity-90" onClick={() => { setSent(false); onClose(); }}>
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="font-body text-sm text-deep-slate">Ваше имя</Label>
              <Input
                className="mt-1 border-warm-tan focus:border-sage"
                placeholder="Как к вам обращаться?"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="font-body text-sm text-deep-slate">Телефон</Label>
              <Input
                className="mt-1 border-warm-tan focus:border-sage"
                placeholder="+7 (___) ___-__-__"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="font-body text-sm text-deep-slate">Направление</Label>
              <Select onValueChange={v => setForm({ ...form, service: v })}>
                <SelectTrigger className="mt-1 border-warm-tan">
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psychotherapy">Психотерапия</SelectItem>
                  <SelectItem value="rehab">Реабилитация</SelectItem>
                  <SelectItem value="group">Групповая терапия</SelectItem>
                  <SelectItem value="family">Семейная терапия</SelectItem>
                  <SelectItem value="art">Арт-терапия</SelectItem>
                  <SelectItem value="other">Хочу посоветоваться</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-sm text-deep-slate">Удобная дата</Label>
              <Input
                type="date"
                className="mt-1 border-warm-tan focus:border-sage"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-body text-sm text-deep-slate">Комментарий (необязательно)</Label>
              <Textarea
                className="mt-1 border-warm-tan focus:border-sage resize-none"
                placeholder="Расскажите немного о своём запросе..."
                rows={3}
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body py-3 text-base">
              Отправить заявку
            </Button>
            <p className="text-center text-xs text-muted-foreground font-body">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* NAVBAR */}
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
              onClick={() => setBookingOpen(true)}
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
              onClick={() => { setBookingOpen(true); setMobileMenuOpen(false); }}
              className="bg-sage text-primary-foreground hover:opacity-90 font-body text-sm w-full"
            >
              Записаться
            </Button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-1/2 h-full">
            <img
              src={HERO_IMAGE}
              alt="Реабилитационный центр"
              className="w-full h-full object-cover opacity-55"
              style={{
                maskImage: "linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)"
              }}
            />
          </div>
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(158 28% 60%) 0%, transparent 70%)" }} />
          <div className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, hsl(35 45% 70%) 0%, transparent 70%)" }} />
        </div>
        <div className="container-max relative z-10 px-6 py-24">
          <div className="max-w-2xl">
            <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-4 animate-fade-in-up">
              Реабилитационный центр
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-deep-slate leading-[1.1] mb-6 animate-fade-in-up delay-100">
              Осознанный<br />
              <span className="text-sage italic">МИР</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg animate-fade-in-up delay-200">
              Место, где начинается путь к себе. Профессиональная помощь в восстановлении, обретении внутренней гармонии и новой жизни.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <Button
                onClick={() => setBookingOpen(true)}
                className="bg-sage text-primary-foreground hover:opacity-90 font-body text-base px-8 py-6 rounded-xl"
              >
                Записаться на консультацию
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollTo("#programs")}
                className="border-sage text-sage hover:bg-sage-light font-body text-base px-8 py-6 rounded-xl"
              >
                Наши программы
              </Button>
            </div>
            <div className="flex items-center gap-10 mt-12 animate-fade-in-up delay-400">
              {[["1200+", "пациентов"], ["12", "лет работы"], ["98%", "довольных"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl text-deep-slate font-medium">{n}</p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section-padding bg-white">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">О центре</p>
              <h2 className="font-display text-4xl md:text-5xl text-deep-slate mb-6 leading-tight">
                Пространство доверия и исцеления
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-5">
                С 2012 года мы помогаем людям обрести устойчивость и вернуться к полноценной жизни. Наш центр — это не просто клиника, это место, где каждый человек встречает понимание, уважение и профессиональную поддержку.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed mb-8">
                Мы работаем с зависимостями, психологическими травмами, тревожными расстройствами и другими состояниями, которые мешают жить в полную силу. Наш подход — доказательный, гуманный и индивидуальный.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "Award", text: "Лицензия Минздрава" },
                  { icon: "Users", text: "22 специалиста" },
                  { icon: "MapPin", text: "Москва и области" },
                  { icon: "Clock", text: "Круглосуточно" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0">
                      <Icon name={icon} size={15} className="text-sage" />
                    </div>
                    <span className="font-body text-sm text-deep-slate">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                <img src={HERO_IMAGE} alt="Центр" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-lg border border-border max-w-xs">
                <p className="font-display text-4xl text-sage font-medium">98%</p>
                <p className="font-body text-sm text-muted-foreground mt-1">пациентов отмечают значительное улучшение состояния</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section-padding bg-warm-cream">
        <div className="container-max">
          <div className="text-center mb-14">
            <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Услуги</p>
            <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">
              Комплексная помощь
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl p-8 card-hover border border-border cursor-pointer"
                onClick={() => setBookingOpen(true)}
              >
                <div className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center mb-5">
                  <Icon name={s.icon} size={22} className="text-sage" />
                </div>
                <h3 className="font-display text-2xl text-deep-slate mb-3">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-sage font-body text-sm">
                  <span>Записаться</span>
                  <Icon name="ArrowRight" size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Программы</p>
            <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">
              Найдите свой путь
            </h2>
            <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
              Каждая программа разработана с учётом индивидуальных потребностей. Мы поможем выбрать подходящий формат.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PROGRAMS.map((p) => (
              <div key={p.title} className={`${p.color} rounded-3xl p-8 flex flex-col border border-border card-hover`}>
                <span className="inline-block font-body text-xs uppercase tracking-wider text-sage bg-white/60 rounded-full px-3 py-1 mb-5 self-start">
                  {p.tag}
                </span>
                <h3 className="font-display text-3xl text-deep-slate mb-4">{p.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
                <div className="mt-8 pt-6 border-t border-warm-tan flex items-center justify-between">
                  <span className="font-display text-xl text-deep-slate">{p.price}</span>
                  <Button
                    size="sm"
                    onClick={() => setBookingOpen(true)}
                    className="bg-sage text-primary-foreground hover:opacity-90 font-body text-sm rounded-xl"
                  >
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-6 bg-sage">
        <div className="container-max text-center">
          <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4 italic">
            Первый шаг — самый важный
          </h2>
          <p className="font-body text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Бесплатная первичная консультация — 30 минут с нашим специалистом без обязательств
          </p>
          <Button
            onClick={() => setBookingOpen(true)}
            className="bg-white text-sage hover:bg-warm-cream font-body text-base px-10 py-6 rounded-xl font-medium"
          >
            Записаться бесплатно
          </Button>
        </div>
      </section>

      {/* SPECIALISTS */}
      <section id="specialists" className="section-padding bg-warm-cream">
        <div className="container-max">
          <div className="text-center mb-14">
            <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Команда</p>
            <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">Наши специалисты</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {SPECIALISTS.map((sp) => (
              <div key={sp.name} className="bg-white rounded-2xl p-6 text-center card-hover border border-border">
                <div className="text-5xl mb-4">{sp.emoji}</div>
                <h3 className="font-display text-xl text-deep-slate mb-1">{sp.name}</h3>
                <p className="font-body text-sm text-sage mb-1">{sp.role}</p>
                <p className="font-body text-xs text-muted-foreground">{sp.exp}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingOpen(true)}
                  className="mt-4 border-sage text-sage hover:bg-sage-light font-body text-xs w-full rounded-xl"
                >
                  Записаться
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Отзывы</p>
            <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">Истории изменений</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-warm-cream rounded-2xl p-8 border border-border card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="font-body text-muted-foreground leading-relaxed italic mb-6">«{r.text}»</p>
                <div>
                  <p className="font-body text-sm font-medium text-deep-slate">{r.name}</p>
                  <p className="font-body text-xs text-sage mt-1">{r.program}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="section-padding bg-warm-cream">
        <div className="container-max">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Блог</p>
              <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">Статьи и советы</h2>
            </div>
            <Button variant="ghost" className="hidden md:flex text-sage hover:text-sage/80 font-body text-sm gap-1">
              Все статьи <Icon name="ArrowRight" size={14} />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <div key={post.title} className="bg-white rounded-2xl overflow-hidden border border-border card-hover cursor-pointer">
                <div className="h-40 bg-sage-light flex items-center justify-center">
                  <Icon name="BookOpen" size={40} className="text-sage opacity-50" />
                </div>
                <div className="p-6">
                  <span className="inline-block font-body text-xs uppercase tracking-wider text-sage bg-sage-light rounded-full px-3 py-1 mb-3">
                    {post.tag}
                  </span>
                  <h3 className="font-display text-xl text-deep-slate leading-snug mb-3">{post.title}</h3>
                  <p className="font-body text-xs text-muted-foreground">{post.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Контакты</p>
            <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">Мы рядом</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              {[
                { icon: "Phone", label: "Телефон", value: "+7 (495) 000-00-00", sub: "Круглосуточно, бесплатно" },
                { icon: "Mail", label: "Email", value: "info@mir-rehab.ru", sub: "Ответим в течение часа" },
                { icon: "MapPin", label: "Адрес", value: "Москва, ул. Примерная, 12", sub: "Пн–Вс с 8:00 до 22:00" },
                { icon: "MessageCircle", label: "Telegram / WhatsApp", value: "@mir_rehab", sub: "Онлайн-консультация" },
              ].map(({ icon, label, value, sub }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center flex-shrink-0">
                    <Icon name={icon} size={20} className="text-sage" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-body text-deep-slate font-medium">{value}</p>
                    <p className="font-body text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-warm-cream rounded-3xl p-8 border border-border">
              <h3 className="font-display text-2xl text-deep-slate mb-6">Бесплатная консультация</h3>
              <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
                Оставьте контакт — наш специалист перезвонит и ответит на все вопросы без обязательств
              </p>
              <div className="space-y-3">
                <Input className="border-warm-tan bg-white font-body" placeholder="Ваше имя" />
                <Input className="border-warm-tan bg-white font-body" placeholder="Телефон или e-mail" />
                <Button
                  onClick={() => setBookingOpen(true)}
                  className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body py-5 text-base rounded-xl"
                >
                  Получить консультацию
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-deep-slate py-10 px-6">
        <div className="container-max flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-xl text-white/80 tracking-wide">
            Осознанный <span className="text-sage">МИР</span>
          </p>
          <p className="font-body text-xs text-white/40 text-center">
            © 2026 Реабилитационный центр «Осознанный МИР». Лицензия Минздрава РФ.
          </p>
          <div className="flex gap-4">
            {["Конфиденциальность", "Оферта"].map(l => (
              <span key={l} className="font-body text-xs text-white/40 hover:text-white/70 cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}