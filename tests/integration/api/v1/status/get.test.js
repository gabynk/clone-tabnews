import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const resp = await fetch("http://localhost:3000/api/v1/status");
      expect(resp.status).toBe(200);

      const respBody = await resp.json();

      const parsedUpdatedAt = new Date(respBody.updated_at).toISOString();
      expect(respBody.updated_at).toEqual(parsedUpdatedAt);

      expect(respBody.dependencies.database.version).toEqual("16.0");
      expect(respBody.dependencies.database.max_connections).toEqual(100);
      expect(respBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
