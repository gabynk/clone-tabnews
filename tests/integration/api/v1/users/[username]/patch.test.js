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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser",
          email: "uniqueUser@curso.dev",
          password: "123456",
        }),
      });

      const resp = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser",
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
        email: "uniqueUser@curso.dev",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail",
          email: "uniqueEmail@curso.dev",
          password: "123456",
        }),
      });

      const resp = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail",
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
        username: "uniqueEmail",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword",
          email: "newPassword@curso.dev",
          password: "123456",
        }),
      });

      const resp = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
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
        username: "newPassword",
        email: "newPassword@curso.dev",
        password: respBody.password,
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });
      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      expect(respBody.updated_at > respBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword");
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "equalityUser",
          email: "equalityUser@curso.dev",
          password: "123456",
        }),
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
        email: "equalityUser@curso.dev",
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
      const respWithSuccess1 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedUsername1",
            email: "duplicateUsername1@curso.dev",
            password: "123456",
          }),
        },
      );
      expect(respWithSuccess1.status).toBe(201);
      const respWithSuccess2 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedUsername2",
            email: "duplicateUsername2@curso.dev",
            password: "123456",
          }),
        },
      );
      expect(respWithSuccess2.status).toBe(201);

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
      const respWithSuccess1 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedEmail1",
            email: "duplicatedEmail1@curso.dev",
            password: "123456",
          }),
        },
      );
      expect(respWithSuccess1.status).toBe(201);
      const respWithSuccess2 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicatedEmail2",
            email: "duplicatedEmail2@curso.dev",
            password: "123456",
          }),
        },
      );
      expect(respWithSuccess2.status).toBe(201);

      const respWithError = await fetch(
        "http://localhost:3000/api/v1/users/duplicatedEmail2",
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
