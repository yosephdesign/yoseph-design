import { useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Box, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useClientAuthStore } from "../store/clientAuthStore";

export const ModelAccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const isAuthenticated = useClientAuthStore((state) => state.isAuthenticated);
  const login = useClientAuthStore((state) => state.login);
  const register = useClientAuthStore((state) => state.register);

  const [mode, setMode] = useState<"login" | "register">(requestedMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast.error("Email and password are required.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const ok =
        mode === "register"
          ? await register(normalizedEmail, password)
          : await login(normalizedEmail, password);

      if (!ok) {
        toast.error(
          mode === "register"
            ? "Registration failed. Email may already exist."
            : "Invalid email or password.",
        );
        return;
      }

      toast.success(
        mode === "register" ? "Registration successful." : "Login successful.",
      );
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-neutral-50 px-4 py-10 md:py-14">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] md:grid-cols-2">
        <section className="relative hidden flex-col justify-between bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#92400e_100%)] p-8 text-white md:flex">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90">
              <Box size={12} /> 3D Access
            </p>
            <h1 className="mt-6 text-3xl font-semibold leading-tight">
              Client Login For
              <br />
              Purchased 3D Models
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              The website is public. Only 3D model downloads require a client
              account and verified purchase.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Yoseph Design
          </p>
        </section>

        <section className="p-5 sm:p-8 md:p-10">
          <div className="mb-5 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft size={14} /> Back to Site
            </Link>
            <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                  mode === "login"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                  mode === "register"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {mode === "register" ? "Create 3D Client Account" : "Client Login"}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Access is only required when you click the 3D model flow.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Password
              </label>
              <input
                type="password"
                required
                minLength={mode === "register" ? 6 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
            >
              {loading
                ? mode === "register"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "register"
                  ? "Register for 3D Access"
                  : "Login to Continue"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};
