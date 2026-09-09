import type { CSSProperties } from "react";
export default function Helix() {
  return (
    <div className="helix" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <i
          key={i}
          style={
            {
              height: `${35 + Math.abs(Math.sin(i * 0.45)) * 95}px`,
              "--i": i,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
