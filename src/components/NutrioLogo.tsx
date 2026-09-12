import logoAsset from "@/assets/nutrio-logo-local.png";

interface NutrioLogoProps {
  className?: string;
}

/** Nutrio brand logo (leaf + bird mark with wordmark). */
export const NutrioLogo = ({ className = "h-9 w-auto" }: NutrioLogoProps) => (
  <img
    src={logoAsset}
    alt="Nutrio — nutrition that adapts to you"
    className={className}
    width={180}
    height={180}
  />
);
