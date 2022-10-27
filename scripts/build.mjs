import esbuild from "esbuild";

async function build() {
  await esbuild
    .build({
      entryPoints: ["src/index.ts"],
      outdir: "dist/",
      bundle: true,
      minify: true,
      treeShaking: true,
      platform: "node",
      sourcemap: true,
      loader: {
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
      external: ["three", "three-stdlib"],
      // external: ["require", "fs", "crypto", "assert", "url"],
      define: {
        "process.env.NODE_ENV": `"development"`,
      },
      plugins: [],
    })
    .then((result) => console.log(result));
}

build().catch((err) => {
  console.error(err);
});
