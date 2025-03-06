import orchestrator from "tests/orchestrator.js";
import database from "infra/database";

describe("Migrations - POST", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await database.query("drop schema public cascade; create schema public;");
  });

  it("should be POST to /api/v1/migrations and return 200", async () => {
    const resp1 = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
    });
    expect(resp1.status).toBe(201);

    const resp1Body = await resp1.json();

    expect(Array.isArray(resp1Body)).toBe(true);
    expect(resp1Body.length).toBeGreaterThan(0);
    expect(resp1Body[0]).toHaveProperty("path", "name", "timestamp");

    const resp2 = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
    });
    expect(resp2.status).toBe(200);

    const resp2Body = await resp2.json();

    expect(Array.isArray(resp2Body)).toBe(true);
    expect(resp2Body.length).toBe(0);
  });
});
