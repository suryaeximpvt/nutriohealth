import logoAsset from "@/assets/nutrio-logo-local.png";

interface VellynLogoProps {
  className?: string;
}

/** Vellyn brand logo (leaf + bird mark with wordmark). */
export const VellynLogo = ({ className = "h-9 w-auto" }: VellynLogoProps) => (
  <img
    src={logoAsset}
    alt="Vellyn — nutrition that adapts to you"
    className={className}
    width={180}
    height={180}
  />
);
