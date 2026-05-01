import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { BLOG_POSTS } from "@/data/blogPosts";
import { SPECIALISTS } from "@/data/specialists";

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



interface SectionsBottomProps {
  onBooking: () => void;
}

export default function SectionsBottom({ onBooking }: SectionsBottomProps) {
  return (
    <>
      {/* SPECIALISTS */}
      <section id="specialists" className="section-padding bg-warm-cream flower-of-life-bg">
        <div className="container-max">
          <div className="flex items-end justify-between mb-14">
            <div className="text-center md:text-left">
              <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Команда</p>
              <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">Наши специалисты</h2>
            </div>
            <Link to="/specialists" className="hidden md:block">
              <Button variant="ghost" className="text-sage hover:text-sage/80 font-body text-sm gap-1">
                Все специалисты <Icon name="ArrowRight" size={14} />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...SPECIALISTS].sort((a,b) => b.rating - a.rating).map((sp) => (
              <Link key={sp.id} to={`/specialists/${sp.id}`} className="group bg-white rounded-2xl overflow-hidden border border-border card-hover flex flex-col">
                <img src={sp.photo} alt={sp.name} className="w-full h-44 object-cover object-top" />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="font-body text-xs text-muted-foreground">{sp.rating}</span>
                  </div>
                  <h3 className="font-display text-lg text-deep-slate mb-0.5 group-hover:text-sage transition-colors">{sp.name}</h3>
                  <p className="font-body text-xs text-sage mb-1">{sp.role}</p>
                  <p className="font-body text-xs text-muted-foreground mb-4">{sp.exp}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.preventDefault(); onBooking(); }}
                    className="mt-auto border-sage text-sage hover:bg-sage-light font-body text-xs w-full rounded-xl"
                  >
                    Записаться
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="section-padding bg-white flower-of-life-bg">
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
      <section id="blog" className="section-padding bg-warm-cream flower-of-life-bg">
        <div className="container-max">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Блог</p>
              <h2 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight">Статьи и советы</h2>
            </div>
            <Link to="/blog">
              <Button variant="ghost" className="hidden md:flex text-sage hover:text-sage/80 font-body text-sm gap-1">
                Все статьи <Icon name="ArrowRight" size={14} />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group bg-white rounded-2xl overflow-hidden border border-border card-hover cursor-pointer block">
                <div className="h-40 bg-sage-light flex items-center justify-center">
                  <Icon name="BookOpen" size={40} className="text-sage opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>
                <div className="p-6">
                  <span className="inline-block font-body text-xs uppercase tracking-wider text-sage bg-sage-light rounded-full px-3 py-1 mb-3">
                    {post.tag}
                  </span>
                  <h3 className="font-display text-xl text-deep-slate leading-snug mb-3 group-hover:text-sage transition-colors">{post.title}</h3>
                  <p className="font-body text-xs text-muted-foreground">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FUND PROMO */}
      <section id="fund" className="section-padding bg-sage-light flower-of-life-bg">
        <div className="container-max">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white rounded-3xl border border-border p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Icon name="Heart" size={26} className="text-sage" />
              </div>
              <div>
                <p className="font-body text-xs text-sage uppercase tracking-[0.2em] mb-1">Благотворительность</p>
                <h2 className="font-display text-3xl md:text-4xl text-deep-slate mb-3">Благотворительный фонд</h2>
                <p className="font-body text-muted-foreground leading-relaxed max-w-lg">
                  Люди, которые верят в нашу миссию и делают помощь возможной. Рейтинг меценатов, биографии и возможность внести свой вклад.
                </p>
              </div>
            </div>
            <Link to="/fund" className="flex-shrink-0">
              <Button className="bg-sage text-primary-foreground hover:opacity-90 font-body gap-2 px-8 py-3 text-base whitespace-nowrap">
                Перейти в фонд <Icon name="ArrowRight" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="section-padding bg-white flower-of-life-bg">
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