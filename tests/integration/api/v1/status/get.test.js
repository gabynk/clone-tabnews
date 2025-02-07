describe("Status - GET", () => {
  it("should be GET to /api/v1/status and return 200", async () => {
    const resp = await fetch("http://localhost:3000/api/v1/status");
    expect(resp.status).toBe(200);
  });
});
