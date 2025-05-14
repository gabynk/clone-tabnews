import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const resp = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );
      expect(resp.status).toBe(200);

      const respBody = await resp.json();
      expect(respBody).toEqual({
        id: respBody.id,
        username: "uniqueUser2",
        email: respBody.email,
        password: respBody.password,
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });
      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      expect(respBody.updated_at > respBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser();

      const resp = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@curso.dev",
          }),
        },
      );
      expect(resp.status).toBe(200);

      const respBody = await resp.json();
      expect(respBody).toEqual({
        id: respBody.id,
        username: respBody.username,
        email: "uniqueEmail2@curso.dev",
        password: respBody.password,
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });
      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      expect(respBody.updated_at > respBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser();

      const resp = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword",
          }),
        },
      );
      expect(resp.status).toBe(200);

      const respBody = await resp.json();
      expect(respBody).toEqual({
        id: respBody.id,
        username: respBody.username,
        email: respBody.email,
        password: respBody.password,
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });
      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      expect(respBody.updated_at > respBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "newPassword",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "123456",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With equality 'username'", async () => {
      await orchestrator.createUser({
        username: "equalityUser",
      });

      const resp = await fetch(
        "http://localhost:3000/api/v1/users/equalityUser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "equalityuser",
          }),
        },
      );
      expect(resp.status).toBe(200);

      const respBody = await resp.json();
      expect(respBody).toEqual({
        id: respBody.id,
        username: "equalityuser",
        email: respBody.email,
        password: respBody.password,
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });
      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      expect(respBody.updated_at > respBody.created_at).toBe(true);
    });

    test("With nonexistent 'username'", async () => {
      const resp = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
        },
      );
      expect(resp.status).toBe(404);

      const respBody = await resp.json();
      expect(respBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "duplicatedUsername1",
      });
      await orchestrator.createUser({
        username: "duplicatedUsername2",
      });

      const respWithError = await fetch(
        "http://localhost:3000/api/v1/users/duplicatedUsername2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedUsername1",
          }),
        },
      );
      expect(respWithError.status).toBe(400);

      const respWithErrorBody = await respWithError.json();
      expect(respWithErrorBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "duplicatedEmail1@curso.dev",
      });
      const createdUser2 = await orchestrator.createUser({
        email: "duplicatedEmail2@curso.dev",
      });

      const respWithError = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "duplicatedEmail1@curso.dev",
          }),
        },
      );
      expect(respWithError.status).toBe(400);

      const respWithErrorBody = await respWithError.json();
      expect(respWithErrorBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });
  });
});
