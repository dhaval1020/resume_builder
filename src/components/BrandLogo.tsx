import { useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

const BrandLogo = ({ className, alt = "ResumeForge logo" }: BrandLogoProps) => {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <FileText className={cn("text-primary", className)} aria-hidden="true" />;
  }

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={cn("object-contain", className)}
      onError={() => setBroken(true)}
    />
  );
};

export default BrandLogo;
