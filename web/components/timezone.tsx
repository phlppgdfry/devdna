"use client";
import { useEffect, useState } from "react";
import { useLocale } from "./preferences";
export default function Timezone({
  value,
  onChange,
}: {
  value: string;
  onChange: (zone: string) => void;
}) {
  const { t } = useLocale();
  const [zones, setZones] = useState([
    "UTC",
    "Europe/Brussels",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]);
  useEffect(() => {
    try {
      const api = Intl as typeof Intl & {
        supportedValuesOf?: (key: string) => string[];
      };
      if (api.supportedValuesOf)
        setZones(["UTC", ...api.supportedValuesOf("timeZone")]);
    } catch {}
  }, []);
  return (
    <div className="actions">
      <label className="field-label">
        {t("Activity timezone", "Tijdzone voor activiteit")}
        <select
          aria-label={t("Activity timezone", "Tijdzone voor activiteit")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {[...new Set([value, ...zones])].map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </label>
      <button
        className="button"
        onClick={() =>
          onChange(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
        }
      >
        {t("Use my timezone", "Mijn tijdzone gebruiken")}
      </button>
    </div>
  );
}
