import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "MesmoCase",
      });

      const respGet = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );
      expect(respGet.status).toBe(200);

      const respGetBody = await respGet.json();
      expect(respGetBody).toEqual({
        id: respGetBody.id,
        username: "MesmoCase",
        email: respGetBody.email,
        password: respGetBody.password,
        created_at: respGetBody.created_at,
        updated_at: respGetBody.updated_at,
      });
      expect(uuidVersion(respGetBody.id)).toBe(4);
      expect(Date.parse(respGetBody.created_at)).not.toBeNaN();
      expect(Date.parse(respGetBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      await orchestrator.createUser({
        username: "CaseDiferente",
      });

      const respGet = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );
      expect(respGet.status).toBe(200);

      const respGetBody = await respGet.json();
      expect(respGetBody).toEqual({
        id: respGetBody.id,
        username: "CaseDiferente",
        email: respGetBody.email,
        password: respGetBody.password,
        created_at: respGetBody.created_at,
        updated_at: respGetBody.updated_at,
      });
      expect(uuidVersion(respGetBody.id)).toBe(4);
      expect(Date.parse(respGetBody.created_at)).not.toBeNaN();
      expect(Date.parse(respGetBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const resp = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
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
  });
});
