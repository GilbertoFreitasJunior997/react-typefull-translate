export class NoTranslationAvaliableError extends Error {
  constructor(key: unknown, language: string, replaces?: object) {
    super(
      `No translation found for ${key}. Language: ${language}. Replaces: ${
        replaces || "none"
      }`
    );
  }
}
