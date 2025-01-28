"use client";

import {
  formatDateWithSettings,
  formatRelativeTimeWithSettings,
} from "@/lib/utils";
import { useEffect, useState } from "react";

interface DateCellProps {
  date: Date | string;
  settings: Record<string, string>;
}

export function DateCell({ date, settings }: DateCellProps) {
  const [mounted, setMounted] = useState(false);
  const formattedDate = formatDateWithSettings(date, settings);
  const relativeTime = formatRelativeTimeWithSettings(date, settings);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col">
      <span>{formattedDate}</span>
      {mounted && (
        <span className="text-sm text-muted-foreground">{relativeTime}</span>
      )}
    </div>
  );
}
