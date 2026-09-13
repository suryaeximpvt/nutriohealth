import logoAsset from "@/assets/vellyn-mark.png.asset.json";

interface VellynLogoProps {
  className?: string;
}

/** Vellyn brand mark. */
export const VellynLogo = ({ className = "h-9 w-auto" }: VellynLogoProps) => (
  <img
    src={logoAsset.url}
    alt="Vellyn"
    className={className}
    width={180}
    height={180}
  />
);
