import database from "infra/database.js";
import email from "infra/email.js";
import webserver from "infra/webserver.js";
import user from "./user.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 min

async function findOneValidById(token) {
  const activationToken = await runSelectQuery(token);
  return activationToken;

  async function runSelectQuery(token) {
    const result = await database.query({
      text: `
        SELECT
          * 
        FROM
          user_activation_tokens
        WHERE
          id = $1
        AND used_at IS NULL
        AND expires_at > NOW()
        LIMIT
          1
        ;`,
      values: [token],
    });

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "EstudosTab <contato@estudostab.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no EstudosTab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro: 

${webserver.origin}/cadastro/ativar/${activationToken.id}
    
Atenciosamente,
Equipe EstudosTab`,
  });
}

async function markTokenAsUsed(tokenId) {
  const usedActivationToken = await runUpdateQuery(tokenId);
  return usedActivationToken;

  async function runUpdateQuery(tokenId) {
    const result = await database.query({
      text: `
        UPDATE 
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [tokenId],
    });

    return result.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, ["create:session"]);
  return activatedUser;
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO 
          user_activation_tokens (user_id, expires_at) 
        VALUES 
          ($1, $2)
        RETURNING
          *
        ;`,
      values: [userId, expiresAt],
    });

    return result.rows[0];
  }
}

const activation = {
  findOneValidById,
  sendEmailToUser,
  markTokenAsUsed,
  activateUserByUserId,
  create,
};

export default activation;
