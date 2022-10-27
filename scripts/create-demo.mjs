/*
A script for quickly bootstraping a new demo
*/
import fs from "fs-extra";
import { Command } from "commander";
import { execSync } from "child_process";

function createPackageJSON(name) {
  return `{
  "name": "${name}",
  "version": "0.0.1",
  "scripts": {
    "start": "node ./scripts/dev.mjs",
    "build": "node ./scripts/build.mjs"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/cquir/particles.git/demos/${name}"
  },
  "license": "ISC",
  "dependencies": {
    "three": "^0.145.0",
    "three-stdlib": "^2.17.3"
  },
  "devDependencies": {
    "@types/three": "^0.144.0",
    "cors": "^2.8.5",
    "esbuild": "^0.14.48",
    "express": "^4.18.1",
    "fs-extra": "^10.1.0",
    "open": "^8.4.0",
    "ws": "^8.8.0"
  }
}  
`}

function createIndexHTML(name) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="ptcl demo - ${name}"
    />

    <link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet">
    <title>ptcl - ${name}</title>
    <link rel="stylesheet" href="/index.css">
  </head>
  <body oncontextmenu="return false;">
    
    <div style="width: 100vw; height: 100vh;">
      <canvas id="game" style="width: 100%; height: 100%;"></canvas>
    </div>
    
    <script src="/index.js"></script>


  </body>
</html>
  `;
}

async function main() {
  const program = new Command();

  program.argument("<name>", "name of demo to create");

  program.parse();

  const name = program.args[0];

  if (fs.existsSync(`demos/${name}`)) {
    throw Error(`Folder 'demos/${name}/' already exists!`);
  }

  fs.mkdirSync(`demos/${name}`);
  fs.mkdirSync(`demos/${name}/public`);
  fs.mkdirSync(`demos/${name}/scripts`);
  fs.mkdirSync(`demos/${name}/src`);
  fs.writeFileSync(`demos/${name}/package.json`, createPackageJSON(name));
  fs.writeFileSync(`demos/${name}/public/index.html`, createIndexHTML(name));
  fs.writeFileSync(`demos/${name}/scripts/dev.mjs`, fs.readFileSync("scripts/demo-templates/dev.mjs"));
  fs.writeFileSync(`demos/${name}/scripts/build.mjs`, fs.readFileSync("scripts/demo-templates/build.mjs"));

  fs.writeFileSync(`demos/${name}/src/index.ts`, fs.readFileSync("scripts/demo-templates/src/index.ts"));
  fs.writeFileSync(`demos/${name}/src/index.css`, fs.readFileSync("scripts/demo-templates/src/index.css"));


  execSync(`cd demos/${name} && npm install &&  npm install ptcl && cd ../..`);
  console.log(`demos/${name} initialized.`);
}

main();
