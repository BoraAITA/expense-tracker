"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationFiltersProps {
  dateFrom: string;
  dateTo: string;
  status: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function NotificationFilters({
  dateFrom,
  dateTo,
  status,
  onDateFromChange,
  onDateToChange,
  onStatusChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="date-from">Başlangıç</Label>
        <Input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="w-[180px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date-to">Bitiş</Label>
        <Input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="w-[180px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Durum</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="SENT">Gönderildi</SelectItem>
            <SelectItem value="FAILED">Başarısız</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
