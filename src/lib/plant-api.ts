const PERENUAL_BASE = "https://perenual.com/api/v2";

function getApiKey() {
  const key = process.env.PERENUAL_API_KEY;
  if (!key) throw new Error("PERENUAL_API_KEY is not set");
  return key;
}

export type PlantSummary = {
  id: number;
  common_name: string;
  scientific_name: string[];
  cycle: string | null;
  watering: string | null;
  sunlight: string[];
  default_image: { thumbnail: string; regular_url: string } | null;
};

export type PlantDetail = {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string | null;
  origin: string[] | null;
  type: string | null;
  dimension: string | null;
  cycle: string | null;
  watering: string | null;
  watering_general_benchmark: { value: string; unit: string } | null;
  sunlight: string[];
  pruning_month: string[] | null;
  growth_rate: string | null;
  maintenance: string | null;
  soil: string[] | null;
  drought_tolerant: boolean;
  indoor: boolean;
  care_level: string | null;
  flowers: boolean;
  flower_color: string | null;
  fruiting: boolean;
  edible_fruit: boolean;
  harvest_season: string | null;
  description: string | null;
  default_image: { thumbnail: string; regular_url: string } | null;
  companions: string[] | null;
};

export async function searchPlants(
  query: string,
  page: number = 1
): Promise<{ data: PlantSummary[]; total: number; lastPage: number }> {
  const key = getApiKey();
  const url = `${PERENUAL_BASE}/species-list?key=${key}&q=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    return { data: [], total: 0, lastPage: 1 };
  }

  const json = await res.json();
  return {
    data: (json.data ?? []).map(mapSummary),
    total: json.total ?? 0,
    lastPage: json.last_page ?? 1,
  };
}

export async function getPlantById(
  id: number
): Promise<{ plant: PlantDetail } | { error: "not_found" | "upgrade_required" }> {
  const key = getApiKey();
  const url = `${PERENUAL_BASE}/species/details/${id}?key=${key}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (res.status === 429) return { error: "upgrade_required" };
  if (!res.ok) return { error: "not_found" };

  const json = await res.json();
  return { plant: mapDetail(json) };
}

function isUpgradePlaceholder(url: string) {
  return url.includes("upgrade_access");
}

function extractImage(raw: { thumbnail?: string; small_url?: string; regular_url?: string; medium_url?: string } | null) {
  if (!raw) return null;
  const thumbnail = raw.thumbnail ?? raw.small_url ?? "";
  const regular = raw.regular_url ?? raw.medium_url ?? "";
  if (isUpgradePlaceholder(thumbnail) || isUpgradePlaceholder(regular)) return null;
  return { thumbnail, regular_url: regular };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSummary(raw: any): PlantSummary {
  return {
    id: raw.id,
    common_name: raw.common_name ?? "Unknown",
    scientific_name: Array.isArray(raw.scientific_name) ? raw.scientific_name : [],
    cycle: raw.cycle ?? null,
    watering: raw.watering ?? null,
    sunlight: Array.isArray(raw.sunlight) ? raw.sunlight : [],
    default_image: extractImage(raw.default_image),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetail(raw: any): PlantDetail {
  return {
    id: raw.id,
    common_name: raw.common_name ?? "Unknown",
    scientific_name: Array.isArray(raw.scientific_name) ? raw.scientific_name : [],
    family: raw.family ?? null,
    origin: Array.isArray(raw.origin) ? raw.origin : null,
    type: raw.type ?? null,
    dimension: raw.dimension ?? null,
    cycle: raw.cycle ?? null,
    watering: raw.watering ?? null,
    watering_general_benchmark: raw.watering_general_benchmark ?? null,
    sunlight: Array.isArray(raw.sunlight) ? raw.sunlight : [],
    pruning_month: Array.isArray(raw.pruning_month) ? raw.pruning_month : null,
    growth_rate: raw.growth_rate ?? null,
    maintenance: raw.maintenance ?? null,
    soil: Array.isArray(raw.soil) ? raw.soil : null,
    drought_tolerant: raw.drought_tolerant ?? false,
    indoor: raw.indoor ?? false,
    care_level: raw.care_level ?? null,
    flowers: raw.flowers ?? false,
    flower_color: raw.flower_color ?? null,
    fruiting: raw.fruiting ?? false,
    edible_fruit: raw.edible_fruit ?? false,
    harvest_season: raw.harvest_season ?? null,
    description: raw.description ?? null,
    default_image: extractImage(raw.default_image),
    companions: Array.isArray(raw.companions) ? raw.companions : null,
  };
}
