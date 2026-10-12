/** Anonymous per-device id (localStorage): one vote per poll and one feedback response per device. */
export function voterId() {
  const k = "ai-era-voter-id";
  try {
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
