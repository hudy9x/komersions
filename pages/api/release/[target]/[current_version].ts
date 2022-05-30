// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { octokit } from "../../../../lib/git";

type Version = {
  url: string;
  version: string;
  notes: string;
  pub_date: string;
  signature: string;
};

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
    owner: "hudy9x",
    repo: "kompad-releases",
  });

  const { tag_name, published_at, assets } = data[0];
  const releases = assets.map(
    ({ browser_download_url, size, download_count, name }) => ({
      browser_download_url,
      size,
      download_count,
      name,
    })
  );

  const platforms: Platform = { windows: {}, macos: {}, linux: {} };

  assets.reduce((platforms, item) => {
    const { browser_download_url, size, download_count, name } = item;
    if (browser_download_url.indexOf(".msi")) {
      platforms.windows = {
        url: browser_download_url,
        version: tag_name,
        notes: "",
        pub_date: published_at || "",
        signature: "",
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