import logoAsset from "@/assets/nutrio-logo.png.asset.json";

interface NutrioLogoProps {
  className?: string;
}

/** Nutrio brand logo (leaf + bird mark with wordmark). */
export const NutrioLogo = ({ className = "h-9 w-auto" }: NutrioLogoProps) => (
  <img
    src={logoAsset.url}
    alt="Nutrio — nutrition that adapts to you"
    className={className}
    width={666}
    height={494}
  />
);
