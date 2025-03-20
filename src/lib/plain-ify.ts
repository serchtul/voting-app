// TODO: Explain why this function (tl;dr: It's a workaround for a libsql serialization issue)
export function plainify<T>(object: T): T {
  if (!object) {
    return object;
  }

  // Spreading doesn't work because nested objects can also have hidden properties
  return JSON.parse(JSON.stringify(object)) as T;
}
