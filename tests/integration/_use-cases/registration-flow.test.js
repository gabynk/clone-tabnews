import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const resp = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "registrationFlow",
        email: "registrationFlow@curso.dev",
        password: "123456",
      }),
    });
    expect(resp.status).toBe(201);

    const respBody = await resp.json();
    expect(respBody).toEqual({
      id: respBody.id,
      username: "registrationFlow",
      email: "registrationFlow@curso.dev",
      password: respBody.password,
      features: ["read:activation_token"],
      created_at: respBody.created_at,
      updated_at: respBody.updated_at,
    });
  });

  test("Receive activation email", async () => {});

  test("Activate account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
