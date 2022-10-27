import fs from "fs-extra";
import esbuild from "esbuild";
import svgrPlugin from "esbuild-plugin-svgr";

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
        ".png": "text",
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
      watch: {
        onRebuild: onBuild,
      },
      define: {
        "process.env.NODE_ENV": `"development"`,
      },
      plugins: [svgrPlugin()],
    })
    .then((result) => onBuild(null, result));

  const app = express();

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

  app.listen(port, () => {
    open(`http://localhost:${port}`);
  });
}

build().catch((err) => {
  console.error(err);
});
