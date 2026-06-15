import type { DataProvider } from "@refinedev/core";
import { http } from "./http";
import { API_URL, API_PREFIX } from "@/shared/config";

/**
 * DataProvider для Django REST Framework.
 *
 * Особенности бэкенда:
 *  - SearchFilter      → ?search=
 *  - OrderingFilter    → ?ordering=field | -field
 *  - DjangoFilterBackend → ?field=value
 *  - Пагинация может быть не настроена: тогда список приходит массивом,
 *    а при включённой PageNumberPagination — объектом {count, results}.
 *  Провайдер корректно обрабатывает оба случая.
 */

type DRFList<T> = T[] | { count: number; results: T[] };

function unwrapList<T>(payload: DRFList<T>): { data: T[]; total: number } {
  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length };
  }
  return { data: payload.results ?? [], total: payload.count ?? 0 };
}

function buildOrdering(sorters?: { field: string; order: "asc" | "desc" }[]) {
  if (!sorters?.length) return undefined;
  return sorters
    .map((s) => (s.order === "desc" ? `-${s.field}` : s.field))
    .join(",");
}

function buildFilters(filters?: any[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!filters) return result;
  for (const filter of filters) {
    if (!("field" in filter)) continue; // пропускаем условные группы
    if (filter.field === "search" || filter.operator === "contains") {
      result.search = filter.value;
      continue;
    }
    result[filter.field] = filter.value;
  }
  return result;
}

export const dataProvider: DataProvider = {
  getApiUrl: () => `${API_URL}${API_PREFIX}`,

  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const { current = 1, pageSize = 20, mode } = pagination ?? {};

    const params: Record<string, unknown> = {
      ...buildFilters(filters),
      ordering: buildOrdering(sorters),
      ...(meta?.params ?? {}),
    };

    if (mode !== "off") {
      params.page = current;
      params.page_size = pageSize;
    }

    const { data } = await http.get<DRFList<any>>(`/${resource}/`, { params });
    return unwrapList(data);
  },

  getOne: async ({ resource, id, meta }) => {
    const { data } = await http.get(`/${resource}/${id}/`, {
      params: meta?.params,
    });
    return { data };
  },

  getMany: async ({ resource, ids, meta }) => {
    // DRF не имеет универсального bulk-эндпоинта — забираем по id.
    const responses = await Promise.all(
      ids.map((id) =>
        http.get(`/${resource}/${id}/`, { params: meta?.params }),
      ),
    );
    return { data: responses.map((r) => r.data) };
  },

  create: async ({ resource, variables }) => {
    const { data } = await http.post(`/${resource}/`, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await http.patch(`/${resource}/${id}/`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await http.delete(`/${resource}/${id}/`);
    return { data };
  },

  custom: async ({ url, method, payload, query, headers }) => {
    const { data } = await http.request({
      url,
      method: method ?? "get",
      data: payload,
      params: query,
      headers,
    });
    return { data };
  },
};
