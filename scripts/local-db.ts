const LOCAL_DB_URL = /^(file:|https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$))/;

export function assertLocalDatabase() {
  if (!LOCAL_DB_URL.test(process.env.TURSO_DATABASE_URL ?? "")) {
    throw new Error("Refusing to run: TURSO_DATABASE_URL must point to a local database");
  }
}
