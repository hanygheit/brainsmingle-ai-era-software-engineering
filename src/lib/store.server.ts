/**
 * Small JSON store in the private `exports` storage bucket (poll open/close state, feedback).
 * Server only: uses the service-role client. No table or migration needed.
 * Local dev without SUPABASE_SERVICE_ROLE_KEY falls back to an in-memory map (compiled out of builds).
 */

const BUCKET = "exports";

const devMemory = () => {
  const g = globalThis as { __aiEraDevStore?: Map<string, string> };
  return (g.__aiEraDevStore ??= new Map());
};
const useDevMemory = () => import.meta.env.DEV && !process.env["SUPABASE_SERVICE_ROLE_KEY"];

async function bucket() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin.storage.from(BUCKET);
}

export async function readJson<T>(path: string): Promise<T | null> {
  if (useDevMemory()) {
    const v = devMemory().get(path);
    return v ? (JSON.parse(v) as T) : null;
  }
  const { data, error } = await (await bucket()).download(path);
  if (error || !data) return null;
  return JSON.parse(await data.text()) as T;
}

/** Writes a JSON file. With `upsert: false` an existing file is kept and `exists` is returned. */
export async function writeJson(path: string, value: unknown, { upsert = true } = {}): Promise<"ok" | "exists"> {
  const body = JSON.stringify(value);
  if (useDevMemory()) {
    if (!upsert && devMemory().has(path)) return "exists";
    devMemory().set(path, body);
    return "ok";
  }
  const { error } = await (await bucket()).upload(path, new Blob([body], { type: "application/json" }), {
    contentType: "application/json",
    upsert,
    cacheControl: "0",
  });
  if (!error) return "ok";
  const status = String((error as { statusCode?: string | number }).statusCode ?? "");
  if (!upsert && (status === "409" || /exists|duplicate/i.test(error.message))) return "exists";
  throw new Error(error.message);
}

/** File names (one level) with their last-write time, without downloading them. `search` filters by name. */
export async function listFiles(folder: string, search?: string): Promise<{ name: string; at: string }[]> {
  if (useDevMemory()) {
    return [...devMemory().entries()]
      .filter(([k]) => k.startsWith(`${folder}/`) && !k.slice(folder.length + 1).includes("/"))
      .map(([k, v]) => ({ name: k.slice(folder.length + 1), at: String((JSON.parse(v) as { at?: string }).at ?? "") }))
      .filter((f) => !search || f.name.includes(search));
  }
  const b = await bucket();
  const out: { name: string; at: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await b.list(folder, { limit: 1000, offset, sortBy: { column: "name", order: "asc" }, ...(search ? { search } : {}) });
    if (error) throw new Error(error.message);
    (data ?? []).forEach((f) => f.id && out.push({ name: f.name, at: f.updated_at ?? f.created_at ?? "" }));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export async function removeFiles(paths: string[]) {
  if (!paths.length) return;
  if (useDevMemory()) {
    paths.forEach((p) => devMemory().delete(p));
    return;
  }
  const b = await bucket();
  for (let i = 0; i < paths.length; i += 500) {
    const { error } = await b.remove(paths.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
}

/** Every JSON file in a folder (one level). */
export async function readFolder<T>(folder: string): Promise<T[]> {
  if (useDevMemory()) {
    return [...devMemory().entries()].filter(([k]) => k.startsWith(`${folder}/`)).map(([, v]) => JSON.parse(v) as T);
  }
  const b = await bucket();
  const names: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await b.list(folder, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    names.push(...(data ?? []).filter((f) => f.name.endsWith(".json")).map((f) => `${folder}/${f.name}`));
    if (!data || data.length < 1000) break;
  }
  const out: T[] = [];
  for (let i = 0; i < names.length; i += 20) {
    const batch = await Promise.all(names.slice(i, i + 20).map((n) => readJson<T>(n).catch(() => null)));
    batch.forEach((v) => v && out.push(v));
  }
  return out;
}
