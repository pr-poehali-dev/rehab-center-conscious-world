import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", city: "", service: "", date: "", comment: "" });
  const [cityInput, setCityInput] = useState("");
  const [cityFiltered, setCityFiltered] = useState<string[]>([]);
  const [cityOpen, setCityOpen] = useState(false);

  const CITIES = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар",
    "Саратов", "Тюмень", "Тольятти", "Иркутск", "Барнаул", "Ульяновск",
    "Владивосток", "Ярославль", "Хабаровск", "Махачкала", "Томск", "Оренбург",
    "Кемерово", "Новокузнецк", "Рязань", "Пенза", "Липецк", "Астрахань",
    "Тула", "Киров", "Чебоксары", "Калининград", "Брянск", "Иваново",
    "Курск", "Магнитогорск", "Тверь", "Набережные Челны", "Белгород",
  ];

  const handleCityInput = (val: string) => {
    setCityInput(val);
    setForm(f => ({ ...f, city: val }));
    if (val.length > 0) {
      setCityFiltered(CITIES.filter(c => c.toLowerCase().startsWith(val.toLowerCase())).slice(0, 6));
      setCityOpen(true);
    } else {
      setCityOpen(false);
    }
  };

  const selectCity = (city: string) => {
    setCityInput(city);
    setForm(f => ({ ...f, city }));
    setCityOpen(false);
  };
  const [sent, setSent] = useState(false);

  const BOOKING_URL = "https://functions.poehali.dev/9821ab4f-4a9c-48fa-8647-754b1a9addf0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["X-Authorization"] = `Bearer ${token}`;
    await fetch(BOOKING_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        city: form.city,
        service: form.service,
        date: form.date,
        comment: form.comment,
      }),
    });
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
            <div className="relative">
              <Label className="font-body text-sm text-deep-slate">Город или населённый пункт</Label>
              <Input
                className="mt-1 border-warm-tan focus:border-sage"
                placeholder="Начните вводить..."
                value={cityInput}
                onChange={e => handleCityInput(e.target.value)}
                onBlur={() => setTimeout(() => setCityOpen(false), 150)}
                autoComplete="off"
                required
              />
              {cityOpen && cityFiltered.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-warm-tan rounded-xl shadow-lg overflow-hidden">
                  {cityFiltered.map(city => (
                    <button
                      key={city}
                      type="button"
                      className="w-full text-left px-4 py-2.5 font-body text-sm text-deep-slate hover:bg-sage-light transition-colors"
                      onMouseDown={() => selectCity(city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
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