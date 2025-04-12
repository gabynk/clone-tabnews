const { spawn } = require("child_process");

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: "inherit" });

    process.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`${command} ${args.join(" ")} falhou com código ${code}`),
        );
      }
      resolve();
    });
  });
}

async function stopServices() {
  console.log("Parando serviços...");
  const stopProcess = spawn("npm", ["run", "services:stop"], {
    stdio: "inherit",
  });

  stopProcess.on("close", (code) => {
    console.log(`Serviços parados. Encerrando aplicação (code: ${code})...`);
    process.exit(code ?? 0);
  });
}

async function startServices() {
  try {
    await runCommand("npm", ["run", "services:up"]);
    await runCommand("npm", ["run", "services:wait:database"]);
    await runCommand("npm", ["run", "migrations:up"]);

    const nextDev = spawn("next", ["dev"], { stdio: "inherit" });

    process.on("SIGINT", stopServices);
    process.on("SIGBREAK", stopServices);

    nextDev.on("close", (code) => {
      console.log(`Next.js encerrado (código ${code}). Parando serviços...`);
      stopServices();
    });

    await new Promise((resolve) => nextDev.on("exit", resolve));
  } catch (error) {
    console.error("Erro ao iniciar serviços:", error);
    process.exit(1);
  }
}

startServices();
