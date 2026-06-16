import { useCustom, useApiUrl } from "@refinedev/core";
import type { ScheduleBoard } from "@/entities/schedule";

/** Доска расписания на неделю (week — любая дата недели, YYYY-MM-DD). */
export function useScheduleBoard(week: string) {
  const apiUrl = useApiUrl();
  return useCustom<ScheduleBoard>({
    url: `${apiUrl}/schedules/board/`,
    method: "get",
    config: { query: { week } },
  });
}

import { useList } from "@refinedev/core";

export interface DoctorLite {
  id: string;
  user: string;
  user_name: string;
  initials: string;
  specialty: string;
  color_hex: string;
  cabinet: string;
}

/** Список врачей (для форм смены и отпуска). */
export function useDoctors() {
  const { data } = useList<DoctorLite>({
    resource: "doctors",
    pagination: { mode: "off" },
  });
  return data?.data ?? [];
}
