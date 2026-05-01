import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import FlowerOfLife from "@/components/FlowerOfLife";

const AUTH_URL = "https://functions.poehali.dev/787350a7-d77a-48bb-99f6-c77466ca7470";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { setError("Введите корректный email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) setStep("code");
      else setError(data.error || "Ошибка отправки");
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setError("Введите 6-значный код"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_URL}?action=verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_email", data.email);
        localStorage.setItem("auth_name", data.name || "");
        navigate("/profile");
      } else {
        setError(data.error || "Неверный код");
      }
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-warm-cream flower-of-life-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <FlowerOfLife size={32} />
          <span className="font-display text-xl text-deep-slate">
            Осознанный <span className="text-sage">МИР</span>
          </span>
        </Link>

        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
          {step === "email" ? (
            <>
              <h1 className="font-display text-2xl text-deep-slate mb-2">Вход в кабинет</h1>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Введите email — пришлём код подтверждения
              </p>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <Label className="font-body text-sm text-deep-slate">Email</Label>
                  <Input
                    type="email"
                    className="mt-1 border-warm-tan focus:border-sage"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive font-body">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body"
                >
                  {loading ? "Отправляем..." : "Получить код"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("email"); setCode(""); setError(""); }}
                className="flex items-center gap-1 text-muted-foreground hover:text-sage font-body text-sm mb-5 transition-colors"
              >
                <Icon name="ArrowLeft" size={14} /> Назад
              </button>
              <h1 className="font-display text-2xl text-deep-slate mb-2">Введите код</h1>
              <p className="font-body text-sm text-muted-foreground mb-1">
                Отправили 6-значный код на
              </p>
              <p className="font-body text-sm font-medium text-deep-slate mb-6">{email}</p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label className="font-body text-sm text-deep-slate">Код из письма</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-1 border-warm-tan focus:border-sage text-center text-2xl tracking-widest font-display"
                    placeholder="000000"
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive font-body">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body"
                >
                  {loading ? "Проверяем..." : "Войти"}
                </Button>
                <button
                  type="button"
                  onClick={() => handleSendCode({ preventDefault: () => {} } as React.FormEvent)}
                  className="w-full font-body text-xs text-muted-foreground hover:text-sage transition-colors"
                >
                  Отправить код повторно
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center font-body text-xs text-muted-foreground mt-6">
          Войдя, вы соглашаетесь с{" "}
          <Link to="/" className="hover:text-sage transition-colors underline underline-offset-2">
            условиями использования
          </Link>
        </p>
      </div>
    </div>
  );
}
