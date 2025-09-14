module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:n/recommended", // Node.js best practices
    "plugin:import/recommended", // Import/export checks
    "plugin:prettier/recommended", // Runs Prettier as an ESLint rule
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
      "no-undef": "error",          // 🚨 undefined variables
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        endOfLine: "auto",
      },
    ],
    "no-console": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // "import/order": [
    //   "error",
    //   {
    //     groups: [
    //       "builtin",
    //       "external",
    //       "internal",
    //       "parent",
    //       "sibling",
    //       "index",
    //     ],
    //     alphabetize: { order: "asc", caseInsensitive: true },
    //     "newlines-between": "always", // ✅ enforce newlines between groups
    //   },
    // ],
  },
  ignorePatterns: ["node_modules", "dist", "build", "coverage"],
};
