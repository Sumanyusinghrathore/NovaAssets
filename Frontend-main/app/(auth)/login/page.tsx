"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AssetFlowLogo from "@/app/components/assetflow/AssetFlowLogo";
import { ROLE_LABELS, ROLE_HOME, type AssetFlowRole } from "@/app/lib/assetflow-roles";
import { apiLogin, apiSendOtp, apiVerifyOtp } from "@/app/lib/api";
import { IconEye, IconEyeOff, IconLock, IconMail } from "@/app/components/icons/Icons";

const loginSchema = z.object({
  method: z.enum(["password", "otp"]),
  identifier: z.string().min(3, "Enter email or phone."),
  secret: z.string().min(4, "Enter a valid password or OTP."),
  role: z.enum(["founder", "admin", "head", "manager", "employee"]),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  {
    email: "superadmin@oddo.com",
    role: "founder" as AssetFlowRole,
    title: "Founder",
    note: "Top access",
  },
  {
    email: "manager@oddo.com",
    role: "manager" as AssetFlowRole,
    title: "Manager",
    note: "Team control",
  },
  {
    email: "tl@oddo.com",
    role: "head" as AssetFlowRole,
    title: "TL",
    note: "Task lead",
  },
  {
    email: "itservice@oddo.com",
    role: "manager" as AssetFlowRole,
    title: "IT Service",
    note: "Support ops",
  },
  {
    email: "employee@oddo.com",
    role: "employee" as AssetFlowRole,
    title: "Employee",
    note: "Personal workspace",
  },
] as const;

const DEMO_PASSWORD = "ODDO@123";

const ROLE_SHORT_LABELS: Record<AssetFlowRole, string> = {
  founder: "Founder",
  admin: "Admin",
  head: "TL",
  manager: "Manager",
  employee: "Employee",
};

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

export default function LoginPage() {
  const router = useRouter();
  const [showSecret, setShowSecret] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState("");
  const [otpPreview, setOtpPreview] = useState("");
  const [companyHint, setCompanyHint] = useState("NovaAssets Pvt. Ltd.");
  const [statusMessage, setStatusMessage] = useState("");
  const [demoHint, setDemoHint] = useState<typeof DEMO_ACCOUNTS[number] | null>(DEMO_ACCOUNTS[1]);

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
      identifier: "superadmin@oddo.com",
      secret: DEMO_PASSWORD,
      role: "founder",
    },
  });

  const method = useWatch({ control, name: "method" });
  const role = useWatch({ control, name: "role" });
  const identifier = useWatch({ control, name: "identifier" });
  const previewRole = (role ?? "admin") as AssetFlowRole;
  const resolvedAccount = useMemo(
    () => DEMO_ACCOUNTS.find((item) => item.email.toLowerCase() === (identifier ?? "").trim().toLowerCase()) ?? null,
    [identifier]
  );

  useEffect(() => {
    if (method === "otp") return;
    setOtpSent(false);
    setOtpChallengeId("");
    setOtpPreview("");
    setStatusMessage("");
  }, [method]);

  useEffect(() => {
    const detected = resolvedAccount;
    setDemoHint(detected);
    setValue("role", detected?.role ?? "founder", { shouldDirty: true, shouldValidate: true });
  }, [resolvedAccount, setValue]);

  const applySession = (selectedRole: AssetFlowRole) => {
    setCookie("assetflow_session", "demo-session");
    setCookie("assetflow_role", selectedRole);
    setCookie("assetflow_identity", identifier ?? "");
    setCookie("assetflow_auth_method", method);
    setCookie("assetflow_company", companyHint);
    router.push(ROLE_HOME[selectedRole]);
  };

  const sendOtp = async () => {
    setStatusMessage("");
    if (method !== "otp") {
      setStatusMessage("Switch to OTP mode to generate and preview an OTP.");
      return;
    }
    if (!identifier?.trim()) {
      setStatusMessage("Enter email or phone first.");
      setValue("secret", "");
      return;
    }

    try {
      const response = await apiSendOtp({ identifier, role });
      setOtpSent(true);
      setOtpChallengeId(response.challengeId);
      setOtpPreview(response.otp);
      setValue("secret", response.otp, { shouldValidate: true, shouldDirty: true });
      setStatusMessage(`OTP generated. It is shown below for setup and will expire at ${new Date(response.expiresAt).toLocaleTimeString()}.`);
    } catch (error) {
      setOtpSent(false);
      setOtpChallengeId("");
      setOtpPreview("");
      setStatusMessage(error instanceof Error ? error.message : "OTP could not be generated.");
    }
  };

  const onSubmit = async (values: LoginValues) => {
    if (values.method === "otp") {
      if (!otpChallengeId) {
        setStatusMessage("Please send OTP first.");
        return;
      }

      try {
        await apiVerifyOtp({
          identifier: values.identifier,
          role: values.role,
          challengeId: otpChallengeId,
          otp: values.secret,
        });
        applySession(values.role);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "OTP verification failed.");
      }
      return;
    }

    try {
      await apiLogin(values.identifier, values.secret);
      applySession(values.role);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-3 text-slate-900 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1520px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr] sm:min-h-[calc(100vh-2.5rem)]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_8%_5%,_rgba(255,255,255,0.94),_transparent_38%),radial-gradient(circle_at_80%_28%,_rgba(196,181,253,0.72),_transparent_43%),linear-gradient(135deg,_#ede9fe_0%,_#eef6ff_56%,_#dbeafe_100%)] p-7 sm:p-10 lg:p-14">
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[28px] border-white/45" />
          <div className="absolute -right-20 bottom-12 h-64 w-64 rounded-full bg-[#5b3df5]/15 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <AssetFlowLogo />
            <div className="my-auto max-w-xl py-16 lg:py-24">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#5b3df5]">Asset operations, simplified</div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                A smarter way to manage every asset.
              </h1>
              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                Built for teams tracking equipment, allocations, maintenance, and approvals in one reliable workspace.
              </p>
              <div className="mt-8 divide-y divide-slate-300/70 border-y border-slate-300/70 text-base leading-7 text-slate-700">
                <p className="py-4">See where every asset is, who has it, and what needs attention.</p>
                <p className="py-4">Give every team the access and visibility they need to move faster.</p>
                <p className="py-4">Keep maintenance, bookings, and audit trails organized from day one.</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">NovaAssets · Enterprise asset management</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-9 flex justify-center"><AssetFlowLogo size={52} /></div>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#5b3df5]">Welcome back</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Sign in to NovaAssets</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Use your account credentials or a one-time password to continue.</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setValue("method", "password")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    method === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setValue("method", "otp")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    method === "otp" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                OTP
              </button>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Email address</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition focus-within:border-[#5b3df5] focus-within:ring-4 focus-within:ring-[#5b3df5]/10">
                  <IconMail size={18} className="text-slate-400" />
                  <input
                    {...register("identifier")}
                    type="email"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                    placeholder="admin@oddo.com"
                  />
                </div>
                {errors.identifier && <span className="text-xs font-medium text-red-600">{errors.identifier.message}</span>}
              </label>

              <input type="hidden" {...register("role")} />

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">{method === "otp" ? "One-time password" : "Password"}</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition focus-within:border-[#5b3df5] focus-within:ring-4 focus-within:ring-[#5b3df5]/10">
                  <IconLock size={18} className="text-slate-400" />
                  <input
                    {...register("secret")}
                    type={showSecret ? "text" : method === "otp" ? "text" : "password"}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                    placeholder={method === "otp" ? "Enter OTP" : `Use ${DEMO_PASSWORD} for demo`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((current) => !current)}
                      className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showSecret ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
                {errors.secret && <span className="text-xs font-medium text-red-600">{errors.secret.message}</span>}
              </label>

              <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="font-semibold text-[#5b3df5] transition hover:text-[#4328d4]"
                >
                  {method === "otp" ? "Send OTP" : "Need OTP preview?"}
                </button>
                <span className="text-xs font-medium">{otpSent ? "OTP ready" : "Secure login"}</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">Detected role</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{ROLE_SHORT_LABELS[previewRole]}</div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {demoHint ? (
                      <>
                        <div>{demoHint.email}</div>
                        <div>{demoHint.title}</div>
                      </>
                    ) : (
                      <div>Demo email required</div>
                    )}
                  </div>
                </div>
              </div>

              {method === "otp" && otpPreview && (
                <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <div className="font-semibold">Temporary OTP response</div>
                  <div className="mt-1 text-emerald-800">
                    OTP: <span className="font-black tracking-[0.2em]">{otpPreview}</span>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div className="rounded-2xl border border-sky-300/40 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                  {statusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#5b3df5] px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_36px_rgba(91,61,245,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Login to Dashboard"}
              </button>
            </form>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick demo access</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button key={account.email} type="button" onClick={() => { setValue("identifier", account.email, { shouldDirty: true, shouldValidate: true }); setValue("role", account.role, { shouldDirty: true, shouldValidate: true }); setDemoHint(account); setStatusMessage(""); }} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${demoHint?.email === account.email ? "border-[#5b3df5]/30 bg-[#f1efff] text-[#4d34d8]" : "border-slate-200 text-slate-600 hover:border-[#5b3df5]/30"}`}>
                    {account.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
