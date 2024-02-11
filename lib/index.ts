import { useCallback, useMemo } from "react";

type ExtractReplaces<T extends string> =
  T extends `${infer _Prev}{{${infer Msg}}}${infer Next}`
    ? Msg | ExtractReplaces<Next>
    : never;

/**
 * A powerful React hook for creating customizable and type-safe translation functions.
 *
 * @param messages   An object containing messages organized by language and key.
 * @param language   The currently selected language code.
 *
 * @example
 * ```javascript
 * const messages = {
 *   hello: {
 *     en: "Hello, {{name}}!",
 *     pt: "Olá, {{name}}!",
 *   },
 * } as const;
 * const useTranslate = () => useCreateTranslate(messages, 'en');
 * 
 * const { t } = useTranslate();
 * const greeting = t('hello', { name: 'Alice' }); // greeting will be "Hello, Alice!"
 * ```
 */
export const useCreateTranslate = <
  TLanguage extends string,
  TMessages extends Record<string, Record<TLanguage, string>>
>(
  messages: TMessages,
  language: TLanguage
) => {
  const t = useCallback(
    <
      TKey extends keyof TMessages,
      TValue extends TMessages[TKey][TLanguage],
      TReplacePatterns extends ExtractReplaces<TValue>,
      TReplace extends Partial<{
        [key in TReplacePatterns]: string;
      }>
    >(
      /** The key (identifier) of the message to translate. */
      key: TKey,
      /**
       * An optional object containing replacement values for dynamic parts of the message.
       * Keys match the placeholder pattern (`{{key}}`) and values must be strings.
       */
      replaces?: TReplace
    ): TValue => {
      try {
        const message = messages[key];
        const hasTranslation =
          message && typeof message === "object" && language in message;

        if (hasTranslation) {
          let translated = String(
            message[language as unknown as keyof typeof message]
          );

          if (replaces) {
            for (const key of Object.keys(replaces)) {
              if (key in replaces) {
                const replacedValue = replaces[key as keyof typeof replaces];
                if (replacedValue !== null && replacedValue !== undefined) {
                  translated = translated.replace(`{{${key}}}`, replacedValue);
                }
              }
            }
          }

          return translated as TValue;
        }

        throw new Error("NO TRANSLATION AVALIABLE");
      } catch (error: unknown) {
        console.error(
          `ERROR TRANSLATING MESSAGE ${String(key)}. REPLACES:`,
          replaces
        );
        console.error(error);
        return "" as TValue;
      }
    },
    [language, messages]
  );

  return useMemo(() => ({ t }), [t]);
};
