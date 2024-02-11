import { useCallback, useMemo } from "react";

import { NoTranslationAvaliableError } from "./errors";

type ExtractReplaces<
  T extends string,
  TReplaceTemplate extends ReplaceTemplate
> = TReplaceTemplate extends "singleCurly"
  ? T extends `${infer _Prev}{${infer Msg}}${infer Next}`
    ? Msg | ExtractReplaces<Next, TReplaceTemplate>
    : never
  : T extends `${infer _Prev}{{${infer Msg}}}${infer Next}`
  ? Msg | ExtractReplaces<Next, TReplaceTemplate>
  : never;

type ReplaceTemplate = "singleCurly" | "dualCurly";

type UseCreateTranslateOptions<TReplaceTemplate extends ReplaceTemplate> = {
  onError?: (error: unknown, defaultMessage: string) => void;

  /**
   * @default "dualCurly"
   */
  replaceTemplate?: TReplaceTemplate;
};

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
 *     ptBr: "Olá, {{name}}!",
 *   },
 * } as const;
 * const useTranslate = () => useCreateTranslate(messages, 'en');
 *
 * const { t } = useTranslate();
 * const greeting = t('hello', { name: 'Alice' }); // greeting will be "Hello, Alice!"
 * ```
 */
const useCreateTranslate = <
  TLanguage extends string,
  TMessages extends Record<string, Record<TLanguage, string>>,
  TReplaceTemplate extends ReplaceTemplate
>(
  messages: TMessages,
  language: TLanguage,
  options?: UseCreateTranslateOptions<TReplaceTemplate>
) => {
  const t = useCallback(
    <
      TKey extends keyof TMessages,
      TValue extends TMessages[TKey][TLanguage],
      TReplacePatterns extends ExtractReplaces<TValue, TReplaceTemplate>,
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
                  const replace =
                    options?.replaceTemplate !== "singleCurly"
                      ? `{{${key}}}`
                      : `{${key}}`;
                  translated = translated.replace(replace, replacedValue);
                }
              }
            }
          }

          return translated as TValue;
        }

        throw new NoTranslationAvaliableError(key, language, replaces);
      } catch (error: unknown) {
        const defaultMessage = `Error translating ${String(
          key
        )}. Language: ${language}. Replaces: ${replaces || "none"}`;

        if (options?.onError) {
          options?.onError(error, defaultMessage);
        } else {
          console.error(defaultMessage, error);
        }

        return "" as TValue;
      }
    },
    [language, messages, options]
  );

  return useMemo(() => ({ t }), [t]);
};

export {
  useCreateTranslate,
  NoTranslationAvaliableError,
  UseCreateTranslateOptions,
  ReplaceTemplate,
};