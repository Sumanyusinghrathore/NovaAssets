"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AssetFlowLogo from "@/app/components/assetflow/AssetFlowLogo";
import { IconArrowLeft, IconBuilding, IconMail, IconPhone, IconShield, IconUser } from "@/app/components/icons/Icons";

const signupSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  companyEmail: z.string().email("Enter a valid company email."),
  companyPhone: z.string().min(8, "Company phone is required."),
  adminName: z.string().min(2, "Admin name is required."),
  adminEmail: z.string().email("Enter a valid admin email."),
  adminPhone: z.string().min(8, "Admin phone is required."),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      adminName: "",
      adminEmail: "",
      adminPhone: "",
    },
  });

  const onSubmit = async () => {
    setSubmitted(true);
    window.setTimeout(() => router.push("/login"), 1200);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-12">
        <section className="glass-panel soft-shadow rounded-[2.2rem] p-6 sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:text-[#5b3df5]">
            <IconArrowLeft size={14} />
            Back to public page
          </Link>

          <div className="mt-6">
            <AssetFlowLogo />
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">Company setup</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Configure the company and the primary admin account first. Backend API integration will consume this structure later.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="rounded-[1.5rem] bg-[#0f172a] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <IconShield size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/45">Setup flow</div>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Company onboarding will later create company, roles, and the first admin user.
                  </p>
                </div>
              </div>
            </div>

            {[
              { title: "Company profile", desc: "Name, email, and phone for the organization." },
              { title: "Admin profile", desc: "Primary admin is created during onboarding." },
              { title: "Role-ready", desc: "Founder/Admin/Head/Manager/Employee access model." },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel soft-shadow rounded-[2.2rem] p-6 sm:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#5b3df5]">
              <IconBuilding size={14} />
              Company onboarding
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Create company and admin</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This page is ready for backend connection, so the form structure stays stable when APIs are added.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              Company setup saved locally. Redirecting to login...
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Company name" icon={<IconBuilding size={18} />} error={errors.companyName?.message} {...register("companyName")} />
                <Field label="Company email" icon={<IconMail size={18} />} type="email" error={errors.companyEmail?.message} {...register("companyEmail")} />
                <Field label="Company phone" icon={<IconPhone size={18} />} error={errors.companyPhone?.message} {...register("companyPhone")} />
                <Field label="Admin name" icon={<IconUser size={18} />} error={errors.adminName?.message} {...register("adminName")} />
                <Field label="Admin email" icon={<IconMail size={18} />} type="email" error={errors.adminEmail?.message} {...register("adminEmail")} />
                <Field label="Admin phone" icon={<IconPhone size={18} />} error={errors.adminPhone?.message} {...register("adminPhone")} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-[#5b3df5] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_36px_rgba(91,61,245,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Create company setup"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  error?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-slate-400">{icon}</span>
        <input
          {...props}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      {error && <span className="text-xs font-medium text-[#ef4444]">{error}</span>}
    </label>
  );
}
