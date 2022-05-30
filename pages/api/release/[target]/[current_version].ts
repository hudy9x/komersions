// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { octokit } from "../../../../lib/git";

type PlatformDetail = {
  url: string;
  version: string;
  notes: string;
  pub_date: string;
  signature: string;
};

type Platform = {
  windows: Partial<PlatformDetail>;
  macos: Partial<PlatformDetail>;
  linux: Partial<PlatformDetail>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>
  // res: NextApiResponse<Version>
) {
  const params = req.query;

  const { data } = await octokit.request("GET /repos/{owner}/{repo}/releases", {
    owner: process.env.GITHUB_OWNER || "",
    repo: process.env.GITHUB_REPO || "",
  });

  const { tag_name, published_at, assets } = data[0];
  const platforms: Platform = { windows: {}, macos: {}, linux: {} };

  assets.reduce((platforms, item) => {
    const { browser_download_url, size, download_count, name } = item;
    if (browser_download_url.indexOf(".msi")) {
      platforms.windows = {
        url: browser_download_url,
        version: tag_name,
        notes: "",
        pub_date: published_at || "",
        signature: process.env.SIGNATURE || "",
      };
    }

    return platforms;
  }, platforms);

  if (params.target === "windows") {
    res.status(200).json(platforms.windows);
    return;
  }

  res.status(204).send("No Content");
}
