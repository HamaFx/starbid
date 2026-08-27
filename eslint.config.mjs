import eslintConfigNext from "eslint-config-next";

const config = [
  ...eslintConfigNext,
  {
    ignores: [".next/**", "node_modules/**", "supabase/.temp/**"],
  },
];

export default config;
