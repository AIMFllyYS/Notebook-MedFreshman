export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getIndexHealth } = await import("./lib/ai/search/indexHealth");
  getIndexHealth();
}
