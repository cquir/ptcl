import esbuild from "esbuild";

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
        ".gif": "text",
        ".tmLanguage": "text",
        ".ttf": "text",
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
      define: {
        "process.env.NODE_ENV": `"development"`,
      },
      plugins: [
        // svgrPlugin()
      ],
    })
    .then((result) => console.log(result));
}

build().catch((err) => {
  console.error(err);
});
