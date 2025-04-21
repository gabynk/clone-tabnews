import useSWR from "swr";

async function fetchStatus(key) {
  const resp = await fetch(key);
  const respBody = await resp.json();
  return respBody;
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return (
    <div>
      <span>Última atualização: {updatedAtText}</span>
    </div>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  let databaseStatusInfo = "Carregando...";

  if (isLoading || (!isLoading && !data)) {
    return databaseStatusInfo;
  }

  databaseStatusInfo = data.dependencies.database;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <h2>Banco de dados</h2>
      <span>Versão: {databaseStatusInfo.version}</span>
      <span>Conexões máximas: {databaseStatusInfo.max_connections}</span>
      <span>Conexão aberta: {databaseStatusInfo.opened_connections}</span>
    </div>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}
