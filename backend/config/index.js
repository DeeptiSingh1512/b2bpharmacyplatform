const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const getEnv = (name, fallback) => {
  if (process.env[name] !== undefined && process.env[name] !== "") {
    return process.env[name];
  }
  return fallback;
};

module.exports = {
  PORT: Number(getEnv("PORT", 3000)),
  API_PREFIX: getEnv("API_PREFIX", "/api"),
  DB_SERVER: getEnv("DB_SERVER", "localhost"),
  DB_PORT: Number(getEnv("DB_PORT", 1433)),
  DB_NAME: getEnv("DB_NAME", "b2bPharmacyDB"),
  DB_USER: getEnv("DB_USER", "sa"),
  DB_PASSWORD: getEnv("DB_PASSWORD", "password"),
  DB_ENCRYPT: getEnv("DB_ENCRYPT", "false") === "true",
  DB_TRUST_SERVER_CERT: getEnv("DB_TRUST_SERVER_CERT", "true") === "true",
  JWT_SECRET: getEnv("JWT_SECRET", "b2bpharma_secret_key_2024"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "7d"),
};
