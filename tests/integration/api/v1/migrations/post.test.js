import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const resp1 = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(resp1.status).toBe(201);

        const resp1Body = await resp1.json();

        expect(Array.isArray(resp1Body)).toBe(true);
        expect(resp1Body.length).toBeGreaterThan(0);
        expect(resp1Body[0]).toHaveProperty("path", "name", "timestamp");
      });

      test("For the second time", async () => {
        const resp2 = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(resp2.status).toBe(200);

        const resp2Body = await resp2.json();

        expect(Array.isArray(resp2Body)).toBe(true);
        expect(resp2Body.length).toBe(0);
      });
    });
  });
});
