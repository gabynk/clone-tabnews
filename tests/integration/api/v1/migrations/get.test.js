import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const resp = await fetch("http://localhost:3000/api/v1/migrations");
      expect(resp.status).toBe(200);

      const respBody = await resp.json();

      expect(Array.isArray(respBody)).toBe(true);
      expect(respBody.length).toBeGreaterThan(0);
    });
  });
});
