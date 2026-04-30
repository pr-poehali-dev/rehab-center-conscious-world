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
