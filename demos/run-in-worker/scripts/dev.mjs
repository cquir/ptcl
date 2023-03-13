import fs from "fs-extra";
import esbuild from "esbuild";
import express from "express";
import * as path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import open from "open";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const onBuild = (error, result) => {
  console.log(result);
  if (error) {
    console.error(error);
    return;
  }

  console.clear();

  console.log(`Listening at http://localhost:${process.env.PORT || 3000} 🚀!`);

  fs.copySync(`./public/index.html`, `./dist/index.html`);
};

async function build() {
  await esbuild
    .build({
      entryPoints: ["src/index.ts", "src/worker.ts"],
      outdir: "dist/",
      bundle: true,
      minify: false,
      treeShaking: false,
      sourcemap: true,
      loader: {
        ".png": "dataurl",
        ".jpg": "dataurl",
        ".gif": "dataurl",
        ".json": "text",
        ".glsl": "text",
        ".frag": "text",
        ".vert": "text",
        ".fbx": "dataurl",
        ".glb": "dataurl",
        ".gltf": "dataurl",
        ".wav": "dataurl",
        ".mp3": "dataurl",
      },
      external: ["require", "fs", "crypto", "assert", "url"],
      watch: {
        onRebuild: onBuild,
      },
      define: {
        "process.env.NODE_ENV": `"development"`,
      },
      plugins: [],
    })
    .then((result) => onBuild(null, result));

  const app = express();

  app.use(cors({ origin: "*" }));

  app.use((_, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOW-FROM *");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });

  app.use(express.static("dist"));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    open(`http://localhost:${port}`);
  });
}

build().catch((err) => {
  console.error(err);
});
