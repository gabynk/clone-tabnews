import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With nonexistent session", async () => {
      const token =
        "43f85fc6c94bb5f2a5aaee708c033855310d90400b4ae907b7bd8b6bb513176d618fc24f8089ead111936b8b3798b23a";

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${token}`,
        },
      });

      expect(resp.status).toBe(401);

      const respBody = await resp.json();

      expect(respBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired user", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "user-expired-session",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(resp.status).toBe(401);

      const respBody = await resp.json();

      expect(respBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With valid user", async () => {
      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(resp.status).toBe(200);

      const respBody = await resp.json();

      expect(respBody).toEqual({
        id: respBody.id,
        token: respBody.token,
        user_id: createdUser.id,
        expires_at: respBody.expires_at,
        created_at: respBody.created_at,
        updated_at: respBody.updated_at,
      });

      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      expect(Date.parse(respBody.expires_at)).not.toBeNaN();

      expect(respBody.expires_at < sessionObject.expires_at.toISOString()).toBe(
        true,
      );
      expect(respBody.updated_at > sessionObject.updated_at.toISOString()).toBe(
        true,
      );

      const parsedSetCookie = setCookieParser(resp, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });

      const doubleCheckResp = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(doubleCheckResp.status).toBe(401);

      const doubleCheckRespBody = await doubleCheckResp.json();

      expect(doubleCheckRespBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
