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

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  item: PaymentItem | null;
}

type Step = "form" | "loading" | "error";

export default function PaymentModal({ open, onClose, item }: PaymentModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    setStep("form");
    setErrorMsg("");
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
        <div className="bg-sage-light rounded-xl p-4 flex items-center justify-between mb-2">
          <div>
            <p className="font-body text-sm text-muted-foreground mb-0.5">Вы оплачиваете</p>
            <p className="font-display text-xl text-deep-slate">{item.name}</p>
            {item.description && (
              <p className="font-body text-xs text-muted-foreground mt-1">{item.description}</p>
            )}
          </div>
          <p className="font-display text-2xl text-sage font-medium whitespace-nowrap ml-4">
            {item.amount.toLocaleString("ru-RU")} ₽
          </p>
        </div>

        {step === "form" && (
          <form onSubmit={handlePay} className="space-y-4 pt-1">
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
                Email <span className="text-muted-foreground">(для чека)</span>
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
              Перейти к оплате
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
            <p className="font-body text-muted-foreground">Создаём платёж...</p>
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
