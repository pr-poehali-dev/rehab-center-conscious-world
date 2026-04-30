import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface SectionsBottomProps {
  onBooking: () => void;
}

export default function SectionsBottom({ onBooking }: SectionsBottomProps) {
  return (
    <>
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
                  onClick={onBooking}
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
                  onClick={onBooking}
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
    </>
  );
}
