import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const resp = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "gabynk",
          email: "gaby@curso.dev",
          password: "123456",
        }),
      });
      expect(resp.status).toBe(201);

      const respBody = await resp.json();
      expect(respBody).toEqual({
        id: respBody.id,
        username: "gabynk",
        email: "gaby@curso.dev",
        password: "123456",
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });
      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated 'email'", async () => {
      const respWithSuccess = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedEmail",
            email: "duplicateEmail@curso.dev",
            password: "123456",
          }),
        },
      );
      expect(respWithSuccess.status).toBe(201);

      const respWithError = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicatedEmail2",
          email: "DuplicateEmail@curso.dev",
          password: "123456",
        }),
      });
      expect(respWithError.status).toBe(400);

      const respWithErrorBody = await respWithError.json();
      expect(respWithErrorBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const respWithSuccess = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedUsername",
            email: "duplicateUsername@curso.dev",
            password: "123456",
          }),
        },
      );
      expect(respWithSuccess.status).toBe(201);

      const respWithError = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "DuplicatedUsername",
          email: "duplicatedUsername2@curso.dev",
          password: "123456",
        }),
      });
      expect(respWithError.status).toBe(400);

      const respWithErrorBody = await respWithError.json();
      expect(respWithErrorBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
        status_code: 400,
      });
    });
  });
});
