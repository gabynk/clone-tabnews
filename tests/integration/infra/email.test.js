const { default: email } = require("infra/email");
const { default: orchestrator } = require("tests/orchestrator");

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Test <contato@test.com.br>",
      to: "gaby@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Test <contato@test.com.br>",
      to: "gaby@curso.dev",
      subject: "Último email - assunto",
      text: "Último email - corpo.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@test.com.br>");
    expect(lastEmail.recipients[0]).toBe("<gaby@curso.dev>");
    expect(lastEmail.subject).toBe("Último email - assunto");
    expect(lastEmail.text).toBe("Último email - corpo.\r\n");
  });
});
