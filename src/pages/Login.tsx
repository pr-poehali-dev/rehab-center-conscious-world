import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import FlowerOfLife from "@/components/FlowerOfLife";

const AUTH_URL = "https://functions.poehali.dev/787350a7-d77a-48bb-99f6-c77466ca7470";

function saveSession(data: { token: string; email: string; name: string | null }) {
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("auth_email", data.email);
  localStorage.setItem("auth_name", data.name || "");
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const action = mode === "register" ? "register" : "login";
      const body = mode === "register"
        ? { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password }
        : { email: form.email.trim().toLowerCase(), password: form.password };

      const res = await fetch(`${AUTH_URL}?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data);
        navigate("/profile");
      } else {
        setError(data.error || "Ошибка");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === "login" ? "register" : "login");
    setError("");
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
          <h1 className="font-display text-2xl text-deep-slate mb-1">
            {mode === "login" ? "Вход в кабинет" : "Регистрация"}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            {mode === "login"
              ? "Введите email и пароль для входа"
              : "Создайте аккаунт — это займёт минуту"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label className="font-body text-sm text-deep-slate">Ваше имя</Label>
                <Input
                  className="mt-1 border-warm-tan focus:border-sage"
                  placeholder="Как вас зовут?"
                  value={form.name}
                  onChange={set("name")}
                  autoFocus
                />
              </div>
            )}

            <div>
              <Label className="font-body text-sm text-deep-slate">Email</Label>
              <Input
                type="email"
                className="mt-1 border-warm-tan focus:border-sage"
                placeholder="example@mail.ru"
                value={form.email}
                onChange={set("email")}
                autoFocus={mode === "login"}
              />
            </div>

            <div>
              <Label className="font-body text-sm text-deep-slate">Пароль</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="border-warm-tan focus:border-sage pr-10"
                  placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"}
                  value={form.password}
                  onChange={set("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-deep-slate transition-colors"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-body">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sage text-primary-foreground hover:opacity-90 font-body"
            >
              {loading
                ? (mode === "register" ? "Регистрируем..." : "Входим...")
                : (mode === "register" ? "Зарегистрироваться" : "Войти")}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="font-body text-sm text-muted-foreground">
              {mode === "login" ? "Ещё нет аккаунта? " : "Уже есть аккаунт? "}
              <button
                onClick={switchMode}
                className="text-sage hover:opacity-80 transition-opacity font-medium"
              >
                {mode === "login" ? "Зарегистрироваться" : "Войти"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center font-body text-xs text-muted-foreground mt-6">
          Входя, вы соглашаетесь с{" "}
          <Link to="/" className="hover:text-sage transition-colors underline underline-offset-2">
            условиями использования
          </Link>
        </p>
      </div>
    </div>
  );
}
