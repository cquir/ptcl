import fs from "fs";
// import path from "path";
import { Octokit } from "@octokit/rest";

// async function uploadPlugin(github, asset, uploadURL) {
//   const contentLength = (filePath) => fs.statSync(filePath).size;
//   const contentType = "binary/octet-stream";
//   // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
//   // for more information
//   const headers = {
//     "content-type": contentType,
//     "content-length": contentLength(asset),
//   };

//   const assetName = path.basename(asset);
//   console.log(`Uploading ${assetName}`);

//   const uploadAssetResponse = await github.repos.uploadReleaseAsset({
//     url: uploadURL,
//     headers,
//     name: assetName,
//     data: fs.readFileSync(asset),
//   });
// }

async function doesReleaseExist(github, tag_name) {
  try {
    await github.repos.getReleaseByTag({
      owner: "cquir",
      repo: "particle",
      tag: tag_name,
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const octokit = new Octokit({ auth: process.env.GIT_PAT });

  const github = octokit.rest;

  const packageJSON = JSON.parse(
    fs.readFileSync("./package.json", {
      encoding: "utf8",
      flag: "r",
    })
  );

  if (!(await doesReleaseExist(github, `ptcl-${packageJSON.version}`))) {
    const release = await github.repos.createRelease({
      owner: "cquir",
      repo: "particle",
      name: `ptcl-${packageJSON.version}`,
      tag_name: `ptcl-${packageJSON.version}`,
      body: `TODO: add automated description here AND add zip creation to release.mjs`,
      generate_release_notes: false,
    });

    const releaseResp = await github.repos.getReleaseByTag({
      owner: "cquir",
      repo: "particle",
      tag: release.data.tag_name,
    });

    const uploadURL = releaseResp.data.upload_url;

    // generate zip here

    // await uploadPlugin(
    //   github,
    //   `./ptcl-${data.version}.zip`,
    //   uploadURL
    // );

  } else {
    console.log("Release already exists, skipping...");
  }
}

main();
