import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/** Одиночный выбор даты. Значение/возврат — ISO-строка «yyyy-MM-dd» или null. */
interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  className,
  id,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {selected ? format(selected, "dd.MM.yyyy", { locale: ru }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            onChange?.(d ? format(d, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          fromYear={1930}
          toYear={new Date().getFullYear() + 1}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Выбор диапазона дат. Значение — {from, to} в виде ISO-строк. */
export interface DateRangeValue {
  from?: string | null;
  to?: string | null;
}

interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Период",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const range: DateRange | undefined =
    value?.from || value?.to
      ? { from: value?.from ? new Date(value.from) : undefined, to: value?.to ? new Date(value.to) : undefined }
      : undefined;

  const label =
    range?.from && range?.to
      ? `${format(range.from, "dd.MM")} — ${format(range.to, "dd.MM.yyyy")}`
      : range?.from
        ? format(range.from, "dd.MM.yyyy")
        : placeholder;

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "justify-start font-normal",
            !range && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{label}</span>
          {range && (
            <X
              className="ml-auto h-3.5 w-3.5 opacity-60 hover:opacity-100"
              onClick={clear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={range?.from}
          numberOfMonths={2}
          onSelect={(r) =>
            onChange?.(
              r
                ? {
                    from: r.from ? format(r.from, "yyyy-MM-dd") : null,
                    to: r.to ? format(r.to, "yyyy-MM-dd") : null,
                  }
                : undefined,
            )
          }
        />
      </PopoverContent>
    </Popover>
  );
}
