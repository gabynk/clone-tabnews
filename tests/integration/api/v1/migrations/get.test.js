import database from "infra/database";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

describe("Migrations - GET", () => {
  beforeEach(cleanDatabase);

  it("should be GET to /api/v1/migrations and return 200", async () => {
    const resp = await fetch("http://localhost:3000/api/v1/migrations");
    expect(resp.status).toBe(200);

    const respBody = await resp.json();

    expect(Array.isArray(respBody)).toBe(true);
    expect(respBody.length).toBeGreaterThan(0);
  });
});
