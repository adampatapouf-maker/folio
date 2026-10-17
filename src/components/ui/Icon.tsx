import { ICON } from "@/lib/icon-data";

export type IconName = keyof typeof ICON;

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Inline lucide-style SVG icon. Mirrors the prototype's `ic()` helper. */
export function Icon({ name, size = 20, color = "currentColor", stroke = 1.9, className, style }: IconProps) {
  const path = ICON[name as string];
  if (!path) return null;
  return (
    <svg
      className={`lucide${className ? " " + className : ""}`}
      viewBox="0 0 24 24"
      style={{ width: size, height: size, stroke: color, strokeWidth: stroke, ...style }}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
