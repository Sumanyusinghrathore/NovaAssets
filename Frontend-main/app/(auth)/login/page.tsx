"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AssetFlowLogo from "@/app/components/assetflow/AssetFlowLogo";
import { ROLE_LABELS, ROLE_HOME, type AssetFlowRole } from "@/app/lib/assetflow-roles";
import { IconEye, IconEyeOff, IconLock, IconMail, IconPhone, IconSparkles, IconUser } from "@/app/components/icons/Icons";

const loginSchema = z.object({
  method: z.enum(["password", "otp"]),
  identifier: z.string().min(3, "Enter email or phone."),
  secret: z.string().min(4, "Enter a valid password or OTP."),
  role: z.enum(["founder", "admin", "head", "manager", "employee"]),
});

type LoginValues = z.infer<typeof loginSchema>;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

export default function LoginPage() {
  const router = useRouter();
  const [showSecret, setShowSecret] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [companyHint, setCompanyHint] = useState("Enterprise Assets Pvt. Ltd.");

  const roleOptions: Array<{ value: AssetFlowRole; label: string }> = useMemo(
    () => [
      { value: "founder", label: ROLE_LABELS.founder },
      { value: "admin", label: ROLE_LABELS.admin },
      { value: "head", label: ROLE_LABELS.head },
      { value: "manager", label: ROLE_LABELS.manager },
      { value: "employee", label: ROLE_LABELS.employee },
    ],
    []
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      method: "password",
      identifier: "admin@assetflow.io",
      secret: "password123",
      role: "admin",
    },
  });

  const method = useWatch({ control, name: "method" });
  const role = useWatch({ control, name: "role" });
  const previewRole = (role ?? "admin") as AssetFlowRole;

  const onSubmit = async (values: LoginValues) => {
    setCookie("assetflow_session", "demo-session");
    setCookie("assetflow_role", values.role);
    setCookie("assetflow_identity", values.identifier);
    setCookie("assetflow_auth_method", values.method);
    setCookie("assetflow_company", companyHint);
    router.push(ROLE_HOME[values.role]);
  };

  const sendOtp = () => {
    setOtpSent(true);
    window.setTimeout(() => setOtpSent(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(91,61,245,0.16),_transparent_32%),radial-gradient(circle_at_85%_18%,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#eef2ff_0%,_#f8fafc_58%,_#f8fafc_100%)]" />
          <div className="absolute left-[10%] top-16 h-72 w-72 rounded-full bg-[#5b3df5]/10 blur-3xl" />
          <div className="absolute bottom-8 right-12 h-56 w-56 rounded-full bg-[#16a34a]/10 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <AssetFlowLogo />
          </div>

          <div className="relative z-10 mt-12 grid gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5b3df5]/15 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#5b3df5] shadow-sm backdrop-blur">
                <IconSparkles size={14} />
                Role aware login
              </div>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                Secure access for every role in the company.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Login can work with email/password or OTP and will route the user into the correct workspace:
                Founder, Admin, Department Head, Asset Manager, or Employee.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Role routing", value: "Dynamic" },
                { label: "Login modes", value: "Password + OTP" },
                { label: "Identity", value: "Email / Phone" },
              ].map((item) => (
                <div key={item.label} className="glass-panel soft-shadow rounded-[1.5rem] p-5">
                  <div className="text-sm font-medium text-slate-500">{item.label}</div>
                  <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="glass-panel soft-shadow rounded-[2rem] p-6 sm:p-8">
              <div className="grid gap-4 lg:grid-cols-2">
                <FeatureChip title="Company landing page" desc="Public page stays accessible without login." />
                <FeatureChip title="Premium shell" desc="Sidebar and navbar adjust by role automatically." />
                <FeatureChip title="Backend ready" desc="JWT, OTP, and company onboarding hooks can attach later." />
                <FeatureChip title="Fast demo flow" desc="Demo role selector helps judges see each workspace instantly." />
              </div>
              <div className="mt-4 rounded-[1.5rem] bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                Workspace preview: {ROLE_LABELS[previewRole]}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#0f172a] px-4 py-8 text-white sm:px-6 lg:px-10">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#5b3df5]/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.3em] text-white/55">Welcome back</div>
                  <h2 className="mt-2 text-3xl font-black tracking-tight">Sign in to AssetFlow</h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <AssetFlowLogo size={40} compact />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/6 p-1">
                <button
                  type="button"
                  onClick={() => setValue("method", "password")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    method === "password" ? "bg-white text-slate-900 shadow-sm" : "text-white/65"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setValue("method", "otp")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    method === "otp" ? "bg-white text-slate-900 shadow-sm" : "text-white/65"
                  }`}
                >
                  OTP
                </button>
              </div>

              <form className="mt-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Email or phone</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    <IconMail size={18} className="text-white/55" />
                    <input
                      {...register("identifier")}
                      type="text"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                      placeholder="admin@assetflow.io or 98xxxxxx"
                    />
                  </div>
                  {errors.identifier && <span className="text-xs font-medium text-[#fca5a5]">{errors.identifier.message}</span>}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Role</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    <IconUser size={18} className="text-white/55" />
                    <select
                      {...register("role")}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      {roleOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.role && <span className="text-xs font-medium text-[#fca5a5]">{errors.role.message}</span>}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">{method === "otp" ? "OTP code" : "Password"}</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    <IconLock size={18} className="text-white/55" />
                    <input
                      {...register("secret")}
                      type={showSecret ? "text" : method === "otp" ? "text" : "password"}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                      placeholder={method === "otp" ? "Enter OTP" : "Enter password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((current) => !current)}
                      className="rounded-full p-1 text-white/55 transition hover:bg-white/10 hover:text-white"
                    >
                      {showSecret ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                  {errors.secret && <span className="text-xs font-medium text-[#fca5a5]">{errors.secret.message}</span>}
                </label>

                <div className="flex items-center justify-between gap-3 text-sm text-white/65">
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="font-semibold text-white/80 transition hover:text-white"
                  >
                    {method === "otp" ? "Send OTP" : "Forgot password?"}
                  </button>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.25em]">
                    <IconPhone size={12} />
                    {otpSent ? "OTP sent" : "Email / Phone"}
                  </span>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-white/80">Company hint</span>
                  <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                    <input
                      value={companyHint}
                      onChange={(e) => setCompanyHint(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                      placeholder="Company name"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-[#5b3df5] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : "Login to Dashboard"}
                </button>

                <p className="text-center text-xs leading-6 text-white/55">
                  Demo mode uses cookies to simulate JWT role routing. Swap this later with backend auth + OTP APIs.
                </p>
              </form>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Quick access</div>
                <div className="mt-3 grid gap-2">
                  <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Public company page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureChip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}
