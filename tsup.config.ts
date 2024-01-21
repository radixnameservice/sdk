import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    plugins: [new NodePolyfillPlugin() as any],
});