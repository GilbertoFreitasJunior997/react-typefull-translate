# @betof/react-typefull-translate

A type-safe React hook for internationalized translations.

## Features

* **Type Safety:** Leverages TypeScript to ensure correct usage of translation keys and replacement values.
* **Dynamic Placeholders:** Easily embed variables within your translations (e.g., `Hello, {{name}}!`).
* **Customizable:**  Hook provides flexibility for integration into your project's translation workflows.

To ensure type safety and seamless usage with the hook, follow these guidelines when creating your messages:

* **Object Structure:**  Organize your translations within an object. Each top-level key represents a translation key, and nested objects define translations for different languages.

```typescript
const messages = {
     welcome: { ... },  // Translation key: 'welcome'
     goodbye: { ... },  // Translation key: 'goodbye'
     // ... more translation keys
} as const;
```
   
* **Language Codes:** Use standard language codes (e.g., 'en', 'pt', 'es')  as keys for the nested language objects.

```typescript
const messages = {
   welcome: {
     en: "Welcome!", 
     pt: "Bem-vindo!",
     // ... more languages
   }
} as const;
   ```

* **Placeholders:**  Utilize double curly braces to define dynamic placeholders in your translations.  

```javascript
const messages = {
   itemCount: {
      en: "You have {{count}} items.",
      pt: "Você tem {{count}} itens.",
   }
} as const;
```
   

* **Type Safety with 'as const':** Declare your `messages` object using `as const` to help TypeScript infer the exact literal types, aiding type safety within the translation hook.

```typescript
export const messages = {
  // ... your translations
} as const; 
```

## Installation

```bash
npm install @betof/react-typefull-translate
```

## Quick Start

1. Declare the messages and languages
```typescript
// translations.ts
export type Language = "en" | "pt" | "es"

export const messages = {
  welcome: {
    en: "Welcome back, {{username}}!",
    pt: "Bem-vindo de volta, {{username}}!",
    es: "¡Bienvenido de nuevo, {{username}}!",
  }
} as const;
```

2. Create your hook
```typescript
// useTranslate.ts
import { useCreateTranslate } from '@betof/react-typefull-translate';
import { type Language, messages } from "./translations";

export const useTranslate = () => {
    const language: Language = "pt"; // Get it from your store/url...
    return useCreateTranslate<Language>(messages, language);
};
```

3. Use the hook
```tsx
import { useTranslate } from "./useTranslate";

export const App = () => {
  const { t } = useTranslate();

  return (
    <div>
      <h1>{t('welcome', { username: 'Bob' })}</h1> {/* Output will be ""Bem-vindo de volta, Bob!"" */}
    </div>
  );
}
```

# Sample dynamic language with Zustand
```typescript
// useTranslate.ts
import { create } from "zustand";
import { useCallback } from "react";
import { useCreateTranslate } from '@betof/react-typefull-translate';
import { type Language, messages } from "./translations";

type UseLanguageStore = {
  language: Language;
  changeLanguage(newLanguage: Language): void;
};
export const useLanguage = create<UseLanguageStore>()((set) => ({
  language: "br",
  changeLanguage: (newLanguage) => set({ language: newLanguage }),
}));

export const useTranslate = () => {
  const language = useLanguage(useCallback((s) => s.language, []));
  return useCreateTranslate(messages, language);
};
```