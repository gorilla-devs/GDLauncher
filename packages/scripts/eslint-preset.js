module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["i18next"],
  extends: [
    "plugin:import/react",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "prettier",
  ],
  rules: {
    "react/prop-types": "off",
    eqeqeq: "error",
    "no-unused-vars": "error",
    "@typescript-eslint/ban-ts-ignore": "off",
    "no-console": "error",
    "i18next/no-literal-string": [
      "off",
      { markupOnly: true, onlyAttribute: ["text"] },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
      },
    },
  },
  overrides: [
    {
      files: ["**/*.{jsx, js}"],
    },
  ],
};
