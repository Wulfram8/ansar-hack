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
