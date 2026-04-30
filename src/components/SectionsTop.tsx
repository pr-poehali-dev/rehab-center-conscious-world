import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/d152e661-1e44-4189-8c8d-fcf36b52b105.jpg";
const ABOUT_IMAGE = "https://cdn.poehali.dev/projects/184f0e0d-a684-434f-8d45-5000ddbe56df/files/49310e31-d9fe-48b0-a186-15f67e0156ff.jpg";

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

interface SectionsTopProps {
  onBooking: () => void;
  scrollTo: (href: string) => void;
}

export default function SectionsTop({ onBooking, scrollTo }: SectionsTopProps) {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient pt-16">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='104' viewBox='0 0 120 104'%3E%3Cg fill='none' stroke='%23a0855a' stroke-width='1'%3E%3Ccircle cx='60' cy='52' r='24'/%3E%3Ccircle cx='84' cy='52' r='24'/%3E%3Ccircle cx='36' cy='52' r='24'/%3E%3Ccircle cx='72' cy='31' r='24'/%3E%3Ccircle cx='48' cy='31' r='24'/%3E%3Ccircle cx='72' cy='73' r='24'/%3E%3Ccircle cx='48' cy='73' r='24'/%3E%3Ccircle cx='60' cy='52' r='48'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "120px 104px",
          backgroundRepeat: "repeat",
          opacity: 0.07,
        }} />
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
                onClick={onBooking}
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
      <section id="about" className="section-padding bg-white flower-of-life-bg">
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
                <img src={ABOUT_IMAGE} alt="Центр" className="w-full h-full object-cover" />
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
      <section id="services" className="section-padding bg-warm-cream flower-of-life-bg">
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
                onClick={onBooking}
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
      <section id="programs" className="section-padding bg-white flower-of-life-bg">
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
                    onClick={onBooking}
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
            onClick={onBooking}
            className="bg-white text-sage hover:bg-warm-cream font-body text-base px-10 py-6 rounded-xl font-medium"
          >
            Записаться бесплатно
          </Button>
        </div>
      </section>
    </>
  );
}