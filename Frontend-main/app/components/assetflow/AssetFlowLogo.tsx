import Image from "next/image";

type AssetFlowLogoProps = {
  size?: number;
  compact?: boolean;
  theme?: "light" | "dark";
};

export default function AssetFlowLogo({
  size = 44,
  compact = false,
  theme = "light",
}: AssetFlowLogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo */}
      <Image
        src="/novaassets_logo.webp"
        alt="NovaAssets Logo"
        width={size}
        height={size}
        priority
        className="object-contain"
        style={{ width: "auto", height: "auto" }}
      />

      {/* Company Name */}
      {!compact && (
        <div className="leading-tight">
          <h1 className={`text-base font-black tracking-[0.16em] ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            NOVAASSETS
          </h1>
          <p className={`text-[11px] font-medium uppercase tracking-[0.28em] ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Enterprise Assets
          </p>
        </div>
      )}
    </div>
  );
}
