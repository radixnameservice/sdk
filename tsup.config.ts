import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    outExtension({ format }) {
        return format === "esm"
            ? { js: ".mjs" }
            : { js: ".cjs" };
    },
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true
});