import vellynMark from "@/assets/vellyn-mark.png";

interface VellynLogoProps {
  className?: string;
}

/** Vellyn brand mark. */
export const VellynLogo = ({ className = "h-9 w-auto" }: VellynLogoProps) => (
  <img
    src={vellynMark}
    alt="Vellyn"
    className={className}
    width={180}
    height={180}
  />
);
