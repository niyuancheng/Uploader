import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import { defineConfig } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const extensions = [".ts"];
export default defineConfig([
  {
    input: "./src/index.ts", //入口

    output: [
      {
        file: "./dist/uploader.cjs.js",
        format: "cjs",
      },
      {
        file: "./dist/uploader.min.cjs.js",
        format: "cjs",
        plugins:[terser()]
      },
      {
        file: "./dist/uploader.es.js",
        format: "es",
      },
      {
        file: "./dist/uploader.min.es.js",
        format: "es",
        plugins:[terser()]
      },
      {
        file: "./dist/uploader.umd.js",
        format: "umd",
        name: "Uploader",
      },
      {
        file: "./dist/uploader.min.umd.js",
        format: "umd",
        name: "Uploader",
        plugins:[terser()]
      },
    ],

    //插件
    plugins: [
      //ts插件让rollup读取ts文件
      ts(),
      nodeResolve({
        extensions,
      }),
      babel(),
    ],
  },
]);
