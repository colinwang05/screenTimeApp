module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./",
            "@app": "./app",
            "@components": "./components",
            "@constants": "./constants",
            "@hooks": "./hooks",
            "@assets": "./assets",
            "@lib": "./lib"   // (for firebase.ts we’ll add in Part 2)
          },
          extensions: [".tsx", ".ts", ".js", ".jsx", ".json"]
        }
      ]
    ]
  };
};
