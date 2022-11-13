import fs from "fs-extra";
import esbuild from "esbuild";
import { Generator } from "@jspm/generator";

async function build() {
  await esbuild.build({
    entryPoints: ["./src/index.ts", "./src/worker.ts"],
    outdir: "./dist",
    bundle: true,
    minify: false,
    platform: "node",
    format: "esm",
    sourcemap: false,
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
    external: ["three", "three-stdlib", "ptcl"],
  });

  const packageJSON = JSON.parse(fs.readFileSync(`./package.json`).toString());

  // console.log(packageJSON);

  const generator = new Generator({
    mapUrl: import.meta.url,
    env: ["browser", "development", "module"],
  });

  // loop through dependencies and create a CDN import map
  // this makes it so that our demos require as few characters as possible
  await Promise.all(
    Object.keys(packageJSON.dependencies).map(async (key) => {
      await generator.install(`${key}@${packageJSON.dependencies[key]}`);
    })
  );

  const importMap = await generator.getMap();

  fs.copySync(`./public/index.html`, `./dist/index.html`);
  let htmlTemplate = fs.readFileSync(`./dist/index.html`).toString();

  // remove the current css and js and replace with inline
  htmlTemplate = htmlTemplate.replace(
    `<link rel="stylesheet" href="/index.css">`,
    ""
  );

  htmlTemplate = htmlTemplate.replace(
    `<script src="/index.js"></script>`,
    `
  <style>
  ${fs.readFileSync(`./dist/index.css`).toString()}
  </style>
  
  <script type="importmap">
  ${JSON.stringify(importMap, null, "\t")}
  </script>
  
  <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
  <script async src="https://ga.jspm.io/npm:es-module-shims@1.5.1/dist/es-module-shims.js" crossorigin="anonymous"></script>

  <script type="module">
  ${fs.readFileSync(`./dist/index.js`).toString()}
  </script>



  `
  );
  fs.writeFileSync(`./dist/index.html`, htmlTemplate);
}

build().catch((err) => {
  console.error(err);
});
