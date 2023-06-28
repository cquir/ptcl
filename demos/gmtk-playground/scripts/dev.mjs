import fs from "fs-extra";
import esbuild from "esbuild";
import express from "express";
import * as path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import open from "open";
import https from "https";

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
      entryPoints: ["src/index.ts"],
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

  const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
  };
  const server = https.createServer(options, app);

  app.use(cors({ origin: "*" }));

  app.use((_, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOW-FROM *");
    next();
  });

  app.use(express.static("dist"));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    open(`https://localhost:${port}`);
  });
}

build().catch((err) => {
  console.error(err);
});
