import Image from "next/image";

type AssetFlowLogoProps = {
  size?: number;
  compact?: boolean;
};

export default function AssetFlowLogo({
  size = 44,
  compact = false,
}: AssetFlowLogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="NovaAssets Logo"
        width={size}
        height={size}
        priority
        className="object-contain"
      />

      {/* Company Name */}
      {!compact && (
        <div className="leading-tight">
          <h1 className="text-base font-black tracking-[0.16em] text-slate-900">
            NOVAASSETS
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
            Enterprise Assets
          </p>
        </div>
      )}
    </div>
  );
}