const { resolve: res } = require("path");
const { accessSync } = require("fs");

exports.interfaceVersion = 2;

exports.resolve = (source) => {
  if (!source.startsWith("@/")) return { found: true, path: null };

  try {
    const absPath = `${res(__dirname, "../src", source.slice(2))}`;
    accessSync(absPath);
    return {
      found: true,
      path: absPath,
    };
  } catch (e) {
    return {
      found: false,
    };
  }
};
