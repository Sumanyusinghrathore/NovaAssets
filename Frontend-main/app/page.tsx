"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import AssetFlowLogo from "@/app/components/assetflow/AssetFlowLogo";
import {
  IconArrowUpRight,
  IconPackage,
  IconUsers,
  IconWrench,
  IconChartBar,
  IconShield,
  IconBell,
  IconBolt,
} from "@/app/components/icons/Icons";

const S = `
  html { scroll-behavior: auto; }

  .af-plat {
    font-family: var(--font-inter, 'Inter', 'Segoe UI', system-ui, sans-serif);
    min-height: 100vh;
    background: #f8fafc;
    color: #0f172a;
    overflow-x: hidden;
  }

  /* ── NAV ─────────────────────────────────────────────────────── */
  .af-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid rgba(148,163,184,0.18);
    background: rgba(248,250,252,0.88);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transform: translateY(-100%);
    opacity: 0;
    transition: transform 0.6s cubic-bezier(.23,1,.32,1), opacity 0.6s;
  }
  .af-nav.nav-visible {
    transform: translateY(0);
    opacity: 1;
  }
  .af-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .af-nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
  }
  .af-nav-link {
    font-size: 13.5px;
    font-weight: 600;
    color: #64748b;
    text-decoration: none;
    transition: color 0.15s;
  }
  .af-nav-link:hover { color: #5b3df5; }
  .af-nav-actions { display: flex; align-items: center; gap: 10px; }
  .af-btn-sm-ghost {
    border: 1px solid rgba(148,163,184,0.3);
    background: white;
    border-radius: 99px;
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    transition: all 0.2s;
  }
  .af-btn-sm-ghost:hover { border-color: #5b3df5; color: #5b3df5; }
  .af-btn-sm-primary {
    background: #5b3df5;
    border-radius: 99px;
    padding: 7px 18px;
    font-size: 13px;
    font-weight: 700;
    color: white;
    text-decoration: none;
    transition: filter 0.2s;
    box-shadow: 0 8px 22px rgba(91,61,245,0.22);
  }
  .af-btn-sm-primary:hover { filter: brightness(1.12); }

  /* ── HERO ─────────────────────────────────────────────────────── */
  .af-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #eef2ff 0%, #f0f4ff 35%, #f8fafc 70%, #f8fafc 100%);
  }
  .af-hero-gfx {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 900px 600px at 72% -5%, rgba(91,61,245,0.12), transparent),
      radial-gradient(ellipse 600px 400px at 5% 90%, rgba(99,102,241,0.08), transparent);
    pointer-events: none;
    will-change: transform;
  }
  .af-hero-inner {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 80px 28px 0;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 60px;
    align-items: flex-end;
  }
  .af-hero-left { padding-bottom: 64px; }

  /* Badge */
  .af-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: white;
    border: 1px solid rgba(91,61,245,0.18);
    border-radius: 99px;
    padding: 4px 12px 4px 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: #5b3df5;
    box-shadow: 0 2px 8px rgba(91,61,245,0.08);
    margin-bottom: 24px;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .af-hero-badge.anim-in { opacity: 1; transform: translateY(0); }
  .af-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #5b3df5;
    animation: af-pulse 2s ease-in-out infinite;
  }
  @keyframes af-pulse {
    0%,100% { opacity: 0.4; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  /* Title — word split */
  .af-hero h1 {
    font-size: clamp(34px, 4.8vw, 56px);
    font-weight: 900;
    color: #0f172a;
    line-height: 1.06;
    letter-spacing: -1.5px;
    margin-bottom: 20px;
  }
  .word-wrap { display: inline-block; overflow: hidden; vertical-align: bottom; }
  .word-inner {
    display: inline-block;
    transform: translateY(110%);
    will-change: transform;
    transition: transform 0.75s cubic-bezier(.23,1,.32,1);
  }
  .word-inner.word-visible { transform: translateY(0); }

  .af-hero-sub {
    font-size: 15.5px;
    line-height: 1.75;
    color: #475569;
    max-width: 520px;
    margin-bottom: 36px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.7s 0.55s ease, transform 0.7s 0.55s ease;
  }
  .af-hero-sub.anim-in { opacity: 1; transform: translateY(0); }
  .af-hero-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.7s 0.72s ease, transform 0.7s 0.72s ease;
  }
  .af-hero-actions.anim-in { opacity: 1; transform: translateY(0); }
  .af-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #5b3df5;
    color: white;
    border: none;
    border-radius: 14px;
    padding: 14px 26px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.25s;
    box-shadow: 0 18px 40px rgba(91,61,245,0.28);
  }
  .af-btn-primary:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
    box-shadow: 0 24px 50px rgba(91,61,245,0.36);
  }
  .af-btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
    color: #334155;
    border: 1.5px solid rgba(148,163,184,0.35);
    border-radius: 14px;
    padding: 13px 24px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.25s;
  }
  .af-btn-outline:hover { border-color: #5b3df5; color: #5b3df5; background: rgba(91,61,245,0.04); }

  /* KPI tiles */
  .af-hero-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-top: 44px;
  }
  .af-kpi-tile {
    background: rgba(255,255,255,0.82);
    border: 1px solid rgba(148,163,184,0.2);
    border-radius: 20px;
    padding: 18px 20px;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 16px rgba(15,23,42,0.06);
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.25s;
  }
  .af-kpi-tile.tile-visible { opacity: 1; transform: translateY(0); }
  .af-kpi-tile:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(91,61,245,0.1);
    border-color: rgba(91,61,245,0.2);
  }
  .af-kpi-tile-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .af-kpi-tile-label { font-size: 12px; font-weight: 600; color: #64748b; }
  .af-kpi-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: #eef2ff; color: #5b3df5;
    display: flex; align-items: center; justify-content: center;
  }
  .af-kpi-val { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #0f172a; }

  /* Hero card */
  .af-hero-card {
    background: #0f172a;
    border-radius: 24px 24px 0 0;
    padding: 30px 28px 36px;
    color: white;
    box-shadow: 0 -12px 60px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.07) inset;
    align-self: flex-end;
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.8s 0.4s ease, transform 0.8s 0.4s cubic-bezier(.23,1,.32,1);
    will-change: transform;
  }
  .af-hero-card.anim-in { opacity: 1; transform: translateX(0); }
  .af-hcard-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .af-hcard-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: rgba(255,255,255,0.38); }
  .af-hcard-av {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #5b3df5, #7c6af7);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; color: white;
  }
  .af-hcard-title { font-size: 24px; font-weight: 900; line-height: 1.2; margin-bottom: 22px; }
  .af-hcard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .af-mini-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px;
    transition: background 0.2s, border-color 0.2s;
  }
  .af-mini-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(91,61,245,0.3); }
  .af-mini-card-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 5px; }
  .af-mini-card-desc { font-size: 11px; color: rgba(255,255,255,0.42); line-height: 1.5; }
  .af-hcard-upcoming {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .af-upcoming-icon {
    width: 32px; height: 32px;
    background: rgba(91,61,245,0.18);
    border: 1px solid rgba(91,61,245,0.3);
    border-radius: 99px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px; color: #a78bfa;
  }
  .af-upcoming-label { font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #a78bfa; margin-bottom: 4px; }
  .af-upcoming-text { font-size: 11.5px; color: rgba(255,255,255,0.5); line-height: 1.55; }

  /* ── FEATURES ─────────────────────────────────────────────────── */
  .af-features { max-width: 1280px; margin: 0 auto; padding: 80px 28px; }
  .af-features-header { text-align: center; margin-bottom: 52px; }
  .af-features-header h2 {
    font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -0.8px; margin-bottom: 10px;
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .af-features-header h2.anim-in { opacity: 1; transform: translateY(0); }
  .af-features-header p {
    font-size: 15px; color: #64748b; max-width: 500px; margin: 0 auto; line-height: 1.7;
    opacity: 0; transform: translateY(18px);
    transition: opacity 0.7s 0.12s ease, transform 0.7s 0.12s ease;
  }
  .af-features-header p.anim-in { opacity: 1; transform: translateY(0); }
  .af-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .af-feat-card {
    background: white;
    border: 1px solid rgba(148,163,184,0.2);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(15,23,42,0.05);
    transition: all 0.3s cubic-bezier(.23,1,.32,1);
    position: relative; overflow: hidden;
    opacity: 0; transform: translateY(40px);
  }
  .af-feat-card.anim-in { opacity: 1; transform: translateY(0); }
  .af-feat-card::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #5b3df5, #7c6af7);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease;
    border-radius: 99px 99px 0 0;
  }
  .af-feat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(91,61,245,0.11);
    border-color: rgba(91,61,245,0.2);
  }
  .af-feat-card:hover::before { transform: scaleX(1); }
  .af-feat-icon { width: 48px; height: 48px; border-radius: 14px; background: #eef2ff; color: #5b3df5; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .af-feat-card h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 10px; line-height: 1.3; }
  .af-feat-card p { font-size: 13.5px; color: #64748b; line-height: 1.65; }

  /* ── ROLES ────────────────────────────────────────────────────── */
  .af-roles-wrap { background: white; border-top: 1px solid rgba(148,163,184,0.15); border-bottom: 1px solid rgba(148,163,184,0.15); }
  .af-roles { max-width: 1280px; margin: 0 auto; padding: 72px 28px; }
  .af-roles-header { text-align: center; margin-bottom: 44px; }
  .af-roles-header h2 { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
  .af-roles-header p { font-size: 14px; color: #64748b; max-width: 420px; margin: 0 auto; line-height: 1.65; }
  .af-roles-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
    background: #f8fafc;
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(15,23,42,0.06);
  }
  .af-role-card {
    background: white;
    border: 1px solid rgba(148,163,184,0.16);
    border-radius: 14px;
    padding: 18px 14px;
    text-align: center;
    transition: all 0.25s cubic-bezier(.23,1,.32,1);
    opacity: 0; transform: translateY(24px) scale(0.96);
  }
  .af-role-card.anim-in { opacity: 1; transform: translateY(0) scale(1); }
  .af-role-card:hover { border-color: rgba(91,61,245,0.25); box-shadow: 0 8px 24px rgba(91,61,245,0.1); transform: translateY(-3px) scale(1.02); }
  .af-role-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg,#eef2ff,#e0e7ff); color: #5b3df5; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
  .af-role-name { font-size: 12.5px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
  .af-role-desc { font-size: 11px; color: #94a3b8; line-height: 1.5; }

  /* ── CTA ──────────────────────────────────────────────────────── */
  .af-cta {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%);
    padding: 88px 28px; text-align: center;
  }
  .af-cta::before {
    content: "";
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(167,139,250,0.1) 1px, transparent 0);
    background-size: 26px 26px;
  }
  .af-cta-orb {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%) scale(0.6);
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(91,61,245,0.22), transparent 65%);
    pointer-events: none; transition: transform 1.2s ease;
    will-change: transform;
  }
  .af-cta-orb.anim-in { transform: translate(-50%,-50%) scale(1); }
  .af-cta-inner { position: relative; z-index: 2; max-width: 660px; margin: 0 auto; }
  .af-cta h2 {
    font-size: 36px; font-weight: 900; color: white; letter-spacing: -0.8px; line-height: 1.15; margin-bottom: 16px;
    opacity: 0; transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .af-cta h2.anim-in { opacity: 1; transform: translateY(0); }
  .af-cta h2 span { color: #a78bfa; }
  .af-cta p {
    font-size: 15px; color: rgba(255,255,255,0.58); line-height: 1.7; margin-bottom: 38px;
    max-width: 520px; margin-left: auto; margin-right: auto;
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.7s 0.15s ease, transform 0.7s 0.15s ease;
  }
  .af-cta p.anim-in { opacity: 1; transform: translateY(0); }
  .af-cta-btns {
    display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-bottom: 30px;
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.7s 0.28s ease, transform 0.7s 0.28s ease;
  }
  .af-cta-btns.anim-in { opacity: 1; transform: translateY(0); }
  .af-btn-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: #5b3df5; color: white; border-radius: 14px; padding: 15px 30px;
    font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.2s;
    box-shadow: 0 18px 48px rgba(91,61,245,0.35);
  }
  .af-btn-cta:hover { filter: brightness(1.1); transform: translateY(-2px); }
  .af-btn-cta-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(255,255,255,0.16);
    border-radius: 14px; padding: 14px 28px; font-size: 15px; font-weight: 600;
    text-decoration: none; transition: all 0.2s;
  }
  .af-btn-cta-ghost:hover { border-color: #a78bfa; color: #a78bfa; }
  .af-cta-note { font-size: 12.5px; color: rgba(255,255,255,0.3); }
  .af-cta-note a { color: #a78bfa; text-decoration: underline; text-underline-offset: 2px; }

  /* ── FOOTER ───────────────────────────────────────────────────── */
  .af-foot { border-top: 1px solid rgba(148,163,184,0.16); background: white; }
  .af-foot-inner { max-width: 1280px; margin: 0 auto; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .af-foot-copy { font-size: 12.5px; color: #94a3b8; }
  .af-foot-links { display: flex; gap: 20px; }
  .af-foot-link { font-size: 12.5px; font-weight: 500; color: #94a3b8; text-decoration: none; transition: color 0.15s; }
  .af-foot-link:hover { color: #5b3df5; }

  /* ── SCROLL REVEAL BASE ───────────────────────────────────────── */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.anim-in { opacity: 1; transform: translateY(0); }

  @media (max-width: 1024px) {
    .af-hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .af-hero-card { border-radius: 24px; }
    .af-hero { padding-bottom: 40px; }
    .af-feat-grid { grid-template-columns: repeat(2, 1fr); }
    .af-roles-grid { grid-template-columns: repeat(3, 1fr); }
    .af-hero-kpis { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .af-nav-links { display: none; }
    .af-feat-grid { grid-template-columns: 1fr; }
    .af-roles-grid { grid-template-columns: repeat(2, 1fr); }
    .af-hero h1 { letter-spacing: -0.8px; }
  }
`;

const ROLES = [
  { name: "Founder",       desc: "Full system visibility, audit logs, and company-wide controls." },
  { name: "Admin",         desc: "User management, configurations, and data exports." },
  { name: "Dept. Head",    desc: "Team assets, booking approvals, and reports." },
  { name: "Asset Manager", desc: "Register, allocate, transfer, and audit assets." },
  { name: "Employee",      desc: "Request assets, book rooms, view own history." },
];

const FEATURES = [
  { icon: <IconPackage size={22} />, title: "Asset Lifecycle Control", desc: "Register every company asset — laptops, vehicles, projectors, furniture — with a serial number, category, and current custodian." },
  { icon: <IconWrench size={22} />,  title: "Bookings & Maintenance",  desc: "Book meeting rooms and shared equipment with conflict detection. Maintenance requests auto-route to the right team." },
  { icon: <IconChartBar size={22} />,title: "Executive Reporting",     desc: "Leadership-ready dashboards with asset utilisation rates, department-wise cost breakdowns, and audit-ready exports." },
  { icon: <IconShield size={22} />,  title: "Role-Based Access",       desc: "Every menu, action, and data point is scoped by role. Founders see everything; employees see only what they need." },
  { icon: <IconBell size={22} />,    title: "Real-Time Notifications", desc: "Instant in-app notifications for approvals, transfers, booking confirmations, and maintenance updates." },
  { icon: <IconBolt size={22} />,    title: "Audit-Ready Compliance",  desc: "Every action is stamped with the acting user, role, and timestamp. Generate a chain-of-custody report instantly." },
];

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lenis: any;
    let gsapModule: any;

    async function init() {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      /* ── LENIS SMOOTH SCROLL ──────────────────────────────────── */
      lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      /* ── NAV SLIDE IN ─────────────────────────────────────────── */
      setTimeout(() => {
        document.querySelector(".af-nav")?.classList.add("nav-visible");
      }, 80);

      /* ── HERO BADGE + SUB + ACTIONS ───────────────────────────── */
      setTimeout(() => document.querySelector(".af-hero-badge")?.classList.add("anim-in"), 150);
      setTimeout(() => document.querySelector(".af-hero-sub")?.classList.add("anim-in"), 200);
      setTimeout(() => document.querySelector(".af-hero-actions")?.classList.add("anim-in"), 300);
      setTimeout(() => document.querySelector(".af-hero-card")?.classList.add("anim-in"), 400);

      /* ── HERO TITLE WORD CASCADE ──────────────────────────────── */
      const titleEl = document.querySelector(".af-hero h1");
      if (titleEl) {
        const text = titleEl.textContent?.trim() ?? "";
        titleEl.innerHTML = text.split(/\s+/).map((w) =>
          `<span class="word-wrap"><span class="word-inner">${w}</span></span>`
        ).join(" ");
        const wordInners = titleEl.querySelectorAll<HTMLElement>(".word-inner");
        wordInners.forEach((el, i) => {
          setTimeout(() => el.classList.add("word-visible"), 100 + i * 60);
        });
      }

      /* ── HERO KPI TILES ───────────────────────────────────────── */
      const tiles = document.querySelectorAll(".af-kpi-tile");
      ScrollTrigger.create({
        trigger: ".af-hero-kpis",
        start: "top 90%",
        onEnter: () => {
          tiles.forEach((tile, i) => {
            setTimeout(() => tile.classList.add("tile-visible"), i * 80);
          });
        },
      });

      /* ── PARALLAX HERO GFX ────────────────────────────────────── */
      gsap.to(".af-hero-gfx", {
        y: -80,
        ease: "none",
        scrollTrigger: { trigger: ".af-hero", start: "top top", end: "bottom top", scrub: 1.5 },
      });

      /* ── HERO CARD PARALLAX ───────────────────────────────────── */
      gsap.to(".af-hero-card", {
        y: -30,
        ease: "none",
        scrollTrigger: { trigger: ".af-hero", start: "top top", end: "bottom top", scrub: 2 },
      });

      /* ── FEATURES HEADER ──────────────────────────────────────── */
      const featH2 = document.querySelector(".af-features-header h2");
      const featP  = document.querySelector(".af-features-header p");
      if (featH2) ScrollTrigger.create({ trigger: featH2, start: "top 85%", onEnter: () => featH2.classList.add("anim-in") });
      if (featP)  ScrollTrigger.create({ trigger: featP,  start: "top 85%", onEnter: () => featP.classList.add("anim-in") });

      /* ── FEATURE CARDS STAGGER ────────────────────────────────── */
      const featCards = document.querySelectorAll(".af-feat-card");
      ScrollTrigger.create({
        trigger: ".af-feat-grid",
        start: "top 80%",
        onEnter: () => {
          featCards.forEach((c, i) => {
            setTimeout(() => c.classList.add("anim-in"), i * 90);
          });
        },
      });

      /* ── ROLES HEADER REVEAL ──────────────────────────────────── */
      document.querySelectorAll(".af-roles-header h2, .af-roles-header p").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top 88%", onEnter: () => el.classList.add("reveal", "anim-in") });
      });

      /* ── ROLE CARDS STAGGER ───────────────────────────────────── */
      const roleCards = document.querySelectorAll(".af-role-card");
      ScrollTrigger.create({
        trigger: ".af-roles-grid",
        start: "top 80%",
        onEnter: () => {
          roleCards.forEach((c, i) => {
            setTimeout(() => c.classList.add("anim-in"), i * 70);
          });
        },
      });

      /* ── CTA SECTION ──────────────────────────────────────────── */
      const ctaOrb  = document.querySelector(".af-cta-orb");
      const ctaH2   = document.querySelector(".af-cta h2");
      const ctaP    = document.querySelector(".af-cta p");
      const ctaBtns = document.querySelector(".af-cta-btns");
      ScrollTrigger.create({
        trigger: ".af-cta",
        start: "top 75%",
        onEnter: () => {
          ctaOrb?.classList.add("anim-in");
          setTimeout(() => ctaH2?.classList.add("anim-in"), 100);
          setTimeout(() => ctaP?.classList.add("anim-in"), 220);
          setTimeout(() => ctaBtns?.classList.add("anim-in"), 340);
        },
      });

      /* ── GENERIC .reveal ELEMENTS ─────────────────────────────── */
      document.querySelectorAll(".reveal").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          onEnter: () => el.classList.add("anim-in"),
        });
      });
    }

    init();

    return () => {
      if (lenis) lenis.destroy();
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.getAll().forEach((t: any) => t.kill()));
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[rgba(248,250,252,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <AssetFlowLogo />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#platform" className="transition hover:text-[#5b3df5]">Platform</a>
            <a href="#roles" className="transition hover:text-[#5b3df5]">Roles</a>
            <a href="#security" className="transition hover:text-[#5b3df5]">Security</a>
            <a href="#contact" className="transition hover:text-[#5b3df5]">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/signup" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#5b3df5]/30 hover:text-[#5b3df5] sm:inline-flex">
              Company setup
            </Link>
            <Link href="/login" className="inline-flex rounded-full bg-[#5b3df5] px-4 py-2 text-sm font-bold text-white shadow-[0_14px_28px_rgba(91,61,245,0.22)] transition hover:brightness-110">
              Login
            </Link>
          </div>
        </div>
      </header>

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="af-hero">
          <div className="af-hero-gfx" />
          <div className="af-hero-inner">
            <div className="af-hero-left">
              <div className="af-hero-badge">
                <span className="af-badge-dot" />
                Enterprise Asset Intelligence
              </div>

              <h1>
                One premium control room for every asset, team, and approval.
              </h1>

              <p className="af-hero-sub">
                AssetFlow helps organizations manage laptops, vehicles, furniture, meeting rooms,
                maintenance, bookings, and audit-ready operations with role-based access for
                Founder, Admin, Department Head, Asset Manager, and Employee.
              </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-[#5b3df5] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_36px_rgba(91,61,245,0.25)] transition hover:brightness-110">
                Enter workspace
                <IconArrowUpRight size={16} />
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#5b3df5]/30 hover:text-[#5b3df5]">
                Setup company
              </Link>
            </div>

              <div className="af-hero-kpis">
                {[
                  { label: "Asset visibility",   val: "12,480", icon: <IconPackage size={15} /> },
                  { label: "Teams onboarded",    val: "118",    icon: <IconUsers size={15} /> },
                  { label: "Maintenance flow",   val: "98.4%",  icon: <IconWrench size={15} /> },
                  { label: "Executive insights", val: "Live",   icon: <IconChartBar size={15} /> },
                ].map((k) => (
                  <div key={k.label} className="af-kpi-tile">
                    <div className="af-kpi-tile-top">
                      <span className="af-kpi-tile-label">{k.label}</span>
                      <span className="af-kpi-icon">{k.icon}</span>
                    </div>
                    <div className="af-kpi-val">{k.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="af-hero-card">
              <div className="af-hcard-header">
                <span className="af-hcard-eyebrow">Role Aware</span>
                <div className="af-hcard-av">AF</div>
              </div>
              <div className="af-hcard-title">
                Founder, Admin,<br />Head, Manager,<br />Employee
              </div>
              <div className="af-hcard-grid">
                {[
                  { t: "Public company page", d: "Accessible without login for brand trust and onboarding." },
                  { t: "Role-based routes",   d: "Dashboard and menus change by login role automatically." },
                  { t: "Email / phone login", d: "Password or OTP flow can plug into backend later." },
                  { t: "Premium UI",          d: "Soft shadows, glass panels, and clean enterprise spacing." },
                ].map((c) => (
                  <div key={c.t} className="af-mini-card">
                    <div className="af-mini-card-title">{c.t}</div>
                    <div className="af-mini-card-desc">{c.d}</div>
                  </div>
                ))}
              </div>
              <div className="af-hcard-upcoming">
                <div className="af-upcoming-icon"><IconBell size={14} /></div>
                <div>
                  <div className="af-upcoming-label">Upcoming</div>
                  <div className="af-upcoming-text">
                    Backend OTP and company onboarding API hooks will attach to this frontend without redesign.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────── */}
        <section id="features">
          <div className="af-features">
            <div className="af-features-header">
              <h2>Everything in one platform</h2>
              <p>Purpose-built modules that cover the full lifecycle of every asset in your organization.</p>
            </div>
            <div className="af-feat-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="af-feat-card">
                  <div className="af-feat-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROLES ─────────────────────────────────────────────── */}
        <section id="roles" className="af-roles-wrap">
          <div className="af-roles">
            <div className="af-roles-header">
              <h2>Designed around your org structure</h2>
              <p>Every role gets exactly the access they need — no more, no less.</p>
            </div>
            <div className="af-roles-grid">
              {ROLES.map((r) => (
                <div key={r.name} className="af-role-card">
                  <div className="af-role-avatar"><IconUsers size={18} /></div>
                  <div className="af-role-name">{r.name}</div>
                  <div className="af-role-desc">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="af-cta">
          <div className="af-cta-orb" />
          <div className="af-cta-inner">
            <h2>
              Ready to bring your <span>operations online?</span>
            </h2>
            <p>
              Set up your company workspace in minutes. Add departments, onboard your team,
              and start tracking every asset from day one.
            </p>
            <div className="af-cta-btns">
              <Link href="/login"  className="af-btn-cta">Enter workspace <IconArrowUpRight size={16} /></Link>
              <Link href="/signup" className="af-btn-cta-ghost">Setup company</Link>
            </div>
            <p className="af-cta-note" id="contact">
              Questions? <Link href="/">Contact your account manager</Link>
            </p>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="af-foot">
          <div className="af-foot-inner">
            <AssetFlowLogo size={32} />
            <span className="af-foot-copy">© 2025 AssetFlow. Enterprise Asset Management.</span>
            <div className="af-foot-links">
              <Link href="/login"  className="af-foot-link">Login</Link>
              <Link href="/signup" className="af-foot-link">Signup</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
