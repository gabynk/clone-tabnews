import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function status(req, res) {
  if (req.method !== "POST" || req.method !== "GET") {
    return res.status(405).json({
      message: `Method - "${req.method}" not allowed`,
    });
  }

  try {
    const dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (req.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return res.status(200).json(pendingMigrations);
    }

    if (req.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return res.status(201).json(migratedMigrations);
      }

      return res.status(200).json(migratedMigrations);
    }

    return res.status(400).end();
  } catch (error) {
    console.log("Error: ", error);
  } finally {
    await dbClient.end();
  }
}
