import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const GET_BOOKINGS_URL = "https://functions.poehali.dev/321ab120-4da2-4b36-a74f-f3637f96ab3e";

interface Booking {
  id: number;
  name: string;
  phone: string;
  city: string;
  service: string;
  date: string;
  comment: string;
  created_at: string;
}

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(GET_BOOKINGS_URL);
      const data = await res.json();
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter(b =>
    [b.name, b.phone, b.city, b.service].some(f =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Шапка */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
            <Icon name="Leaf" size={16} className="text-sage" />
          </div>
          <div>
            <p className="font-display text-lg text-deep-slate leading-tight">Осознанный МИР</p>
            <p className="font-body text-xs text-muted-foreground">Панель администратора</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          className="font-body border-warm-tan text-deep-slate gap-2"
        >
          <Icon name="RefreshCw" size={14} />
          Обновить
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">Всего заявок</p>
            <p className="font-display text-3xl text-deep-slate">{total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">Сегодня</p>
            <p className="font-display text-3xl text-deep-slate">
              {bookings.filter(b => b.created_at.startsWith(new Date().toLocaleDateString("ru-RU").split(".").reverse().join(".")
                .replace(/(\d{4})\.(\d{2})\.(\d{2})/, "$3.$2.$1"))).length}
            </p>
          </div>
          <div className="bg-sage-light rounded-2xl border border-sage/20 p-5 col-span-2 sm:col-span-1">
            <p className="font-body text-xs text-sage uppercase tracking-wider mb-1">Результат поиска</p>
            <p className="font-display text-3xl text-sage">{filtered.length}</p>
          </div>
        </div>

        {/* Поиск */}
        <div className="relative mb-6">
          <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-warm-tan rounded-xl font-body text-sm text-deep-slate bg-white placeholder:text-muted-foreground focus:outline-none focus:border-sage transition-colors"
            placeholder="Поиск по имени, телефону, городу, услуге..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Таблица */}
        {loading ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground font-body gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-sage border-t-transparent animate-spin" />
            Загружаем заявки...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground font-body gap-2">
            <Icon name="InboxIcon" size={36} className="opacity-30" />
            <p>Заявок не найдено</p>
          </div>
        ) : (
          <>
            {/* Desktop таблица */}
            <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">#</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">Клиент</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">Телефон</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">Город</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">Услуга</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">Дата</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-body font-normal">Заявка</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 text-deep-slate font-medium">{b.name}</td>
                      <td className="px-4 py-3">
                        <a href={`tel:${b.phone}`} className="text-sage hover:underline">{b.phone}</a>
                      </td>
                      <td className="px-4 py-3 text-deep-slate">{b.city}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-sage-light text-sage text-xs px-2.5 py-1 rounded-full">
                          {b.service}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.date}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{b.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile карточки */}
            <div className="md:hidden space-y-3">
              {filtered.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-body font-medium text-deep-slate">{b.name}</p>
                    <span className="bg-sage-light text-sage text-xs px-2.5 py-1 rounded-full font-body">{b.service}</span>
                  </div>
                  <div className="space-y-1 text-sm font-body text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Phone" size={13} />
                      <a href={`tel:${b.phone}`} className="text-sage">{b.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={13} />
                      <span>{b.city}</span>
                    </div>
                    {b.date !== "—" && (
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={13} />
                        <span>{b.date}</span>
                      </div>
                    )}
                    {b.comment && (
                      <p className="mt-2 text-xs bg-muted/40 rounded-lg px-3 py-2">{b.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground/60 pt-1">{b.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
