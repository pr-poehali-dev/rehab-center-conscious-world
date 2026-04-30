import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

const PAYMENT_URL = "https://functions.poehali.dev/50d0dabc-5bae-47b4-9cf2-bf92e66bf24e";

export interface PaymentItem {
  name: string;
  amount: number;
  description?: string;
}

type PaymentMethod = "card" | "sbp" | "mir";
type Step = "form" | "loading" | "error";

const METHODS: { id: PaymentMethod; label: string; icon: string; badge?: string }[] = [
  { id: "card", label: "Банковская карта", icon: "CreditCard" },
  { id: "sbp", label: "СБП", icon: "Zap", badge: "Быстро" },
  { id: "mir", label: "МИР Pay", icon: "Smartphone" },
];

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  item: PaymentItem | null;
}

export default function PaymentModal({ open, onClose, item }: PaymentModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    setStep("form");
    setErrorMsg("");
    setMethod("card");
    setForm({ name: "", phone: "", email: "" });
    onClose();
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setStep("loading");

    try {
      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: item.name,
          amount: item.amount,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setErrorMsg(data.error || "Не удалось создать платёж");
        setStep("error");
      }
    } catch {
      setErrorMsg("Ошибка соединения. Попробуйте ещё раз.");
      setStep("error");
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-deep-slate font-normal">
            Оплата услуги
          </DialogTitle>
        </DialogHeader>

        {/* Карточка услуги */}
        <div className="bg-sage-light rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">Вы оплачиваете</p>
            <p className="font-display text-xl text-deep-slate">{item.name}</p>
            {item.description && (
              <p className="font-body text-xs text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
          <p className="font-display text-2xl text-sage font-medium whitespace-nowrap ml-4">
            {item.amount.toLocaleString("ru-RU")} ₽
          </p>
        </div>

        {step === "form" && (
          <form onSubmit={handlePay} className="space-y-4 pt-1">

            {/* Выбор способа оплаты */}
            <div>
              <Label className="font-body text-sm text-deep-slate mb-2 block">Способ оплаты</Label>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all font-body text-xs
                      ${method === m.id
                        ? "border-sage bg-sage-light text-sage"
                        : "border-border bg-white text-muted-foreground hover:border-sage/40"
                      }`}
                  >
                    {m.badge && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-sage text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-body leading-none">
                        {m.badge}
                      </span>
                    )}
                    <Icon name={m.icon} size={18} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Поля формы */}
            <div>
              <Label className="font-body text-sm text-deep-slate">Ваше имя</Label>
              <Input
                className="mt-1 border-warm-tan"
                placeholder="Иван Иванов"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="font-body text-sm text-deep-slate">Телефон</Label>
              <Input
                className="mt-1 border-warm-tan"
                placeholder="+7 (___) ___-__-__"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="font-body text-sm text-deep-slate">
                Email <span className="text-muted-foreground font-body text-xs">(для чека)</span>
              </Label>
              <Input
                type="email"
                className="mt-1 border-warm-tan"
                placeholder="mail@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body py-5 text-base rounded-xl"
            >
              <Icon name="CreditCard" size={18} className="mr-2" />
              {method === "sbp" && "Оплатить через СБП"}
              {method === "mir" && "Оплатить через МИР Pay"}
              {method === "card" && "Перейти к оплате"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-body">
              <Icon name="Lock" size={13} />
              <span>Безопасная оплата через Тинькофф</span>
            </div>
          </form>
        )}

        {step === "loading" && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full border-2 border-sage border-t-transparent animate-spin mx-auto mb-4" />
            <p className="font-body text-muted-foreground">
              {method === "sbp" && "Подготавливаем QR-код СБП..."}
              {method === "mir" && "Открываем МИР Pay..."}
              {method === "card" && "Создаём платёж..."}
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">😔</div>
            <p className="font-body text-destructive mb-4">{errorMsg}</p>
            <Button
              onClick={() => setStep("form")}
              className="bg-sage text-primary-foreground hover:opacity-90 font-body"
            >
              Попробовать снова
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}