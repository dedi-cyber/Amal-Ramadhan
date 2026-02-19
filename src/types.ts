import { Type } from "@google/genai";

export enum AmalCategory {
  INDIVIDU = "Individu",
  KELUARGA_MASYARAKAT = "Keluarga & Masyarakat",
}

export enum AmalType {
  BOOLEAN = "boolean",
  NUMBER = "number",
  CURRENCY = "currency",
}

export interface AmalTarget {
  id: string;
  label: string;
  category: AmalCategory;
  type: AmalType;
  targetValue: number; // 1 for boolean, specific number for others
  unit?: string;
  description?: string;
  frequency: "daily" | "weekly" | "last10days";
}

export interface DailyLog {
  date: string; // ISO string YYYY-MM-DD
  values: Record<string, number>; // amalId -> value
}
