import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(req, res) {
  try {
    const dbName = process.env.POSTGRES_DB;

    const updatedAt = new Date().toISOString();

    const dbVersionResult = await database.query("SHOW server_version;");
    const dbVersionResultValue = dbVersionResult.rows[0].server_version;

    const dbMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    );
    const dbMaxConnectionsResultValue =
      dbMaxConnectionsResult.rows[0].max_connections;

    const dbOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [dbName],
    });
    const dbOpenedConnectionsResultValue =
      dbOpenedConnectionsResult.rows[0].count;

    res.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: dbVersionResultValue,
          max_connections: parseInt(dbMaxConnectionsResultValue),
          opened_connections: dbOpenedConnectionsResultValue,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.error(publicErrorObject);

    res.status(500).json(publicErrorObject);
  }
}

export default status;
