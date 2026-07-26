import webserver from "infra/webserver.js";
import activation from "models/activation.js";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserResp;
  let activationToken;

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

    createUserResp = await resp.json();
    expect(createUserResp).toEqual({
      id: createUserResp.id,
      username: "registrationFlow",
      email: "registrationFlow@curso.dev",
      password: createUserResp.password,
      features: ["read:activation_token"],
      created_at: createUserResp.created_at,
      updated_at: createUserResp.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    activationToken = await orchestrator.extractUUID(lastEmail.text);

    expect(lastEmail.sender).toBe("<contato@estudostab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registrationFlow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no EstudosTab!");
    expect(lastEmail.text).toContain("registrationFlow");
    expect(lastEmail.text).toContain(activationToken);
    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationToken}`,
    );

    const activationTokenObject =
      await activation.findOneValidById(activationToken);

    expect(activationTokenObject.user_id).toBe(createUserResp.id);
    expect(activationTokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResp = await fetch(
      `http://localhost:3000/api/v1/activations/${activationToken}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResp.status).toBe(200);

    const activationRespBody = await activationResp.json();

    expect(Date.parse(activationRespBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("registrationFlow");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {});

  test("Get user information", async () => {});
});
