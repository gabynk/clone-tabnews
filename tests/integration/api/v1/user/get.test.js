import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid user", async () => {
      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const resp = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(resp.status).toBe(200);

      const cacheControl = resp.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const respBody = await resp.json();

      expect(respBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      const parsedSetCookie = setCookieParser(resp, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const token =
        "43f85fc6c94bb5f2a5aaee708c033855310d90400b4ae907b7bd8b6bb513176d618fc24f8089ead111936b8b3798b23a";

      const resp = await fetch("http://localhost:3000/api/v1/user", {
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

      const resp = await fetch("http://localhost:3000/api/v1/user", {
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

    test("With almost expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - (session.EXPIRATION_IN_MILLISECONDS - 100)),
      });

      const createdUser = await orchestrator.createUser({
        username: "user-session-almost-expired",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const resp = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(resp.status).toBe(200);

      const respBody = await resp.json();

      expect(respBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(respBody.id)).toBe(4);
      expect(Date.parse(respBody.created_at)).not.toBeNaN();
      expect(Date.parse(respBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      const parsedSetCookie = setCookieParser(resp, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
