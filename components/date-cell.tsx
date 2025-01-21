import {
  formatDateWithSettings,
  formatRelativeTimeWithSettings,
} from "@/lib/utils";

interface DateCellProps {
  date: Date | string;
  settings: Record<string, string>;
  formattedDate: string;
  relativeTime: string;
}

export function DateCell({ formattedDate, relativeTime }: DateCellProps) {
  return (
    <div className="flex flex-col">
      <span>{formattedDate}</span>
      <span className="text-sm text-muted-foreground">{relativeTime}</span>
    </div>
  );
}
