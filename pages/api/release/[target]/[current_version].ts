// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
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
  try {
    const params = req.query;

    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/releases",
      {
        owner: process.env.GITHUB_OWNER || "",
        repo: process.env.GITHUB_REPO || "",
      }
    );

    const { tag_name, published_at, assets } = data[0];
    const platforms: Platform = { windows: {}, macos: {}, linux: {} };

    for (const item of assets) {
      const { browser_download_url, size, download_count, name } = item;
      if (/msi\.zip$/.test(browser_download_url)) {
        platforms.windows = {
          url: browser_download_url,
          version: tag_name,
          notes: "",
          pub_date: published_at || "",
          signature: "",
        };
      }

      if (/msi\.zip\.sig$/.test(browser_download_url)) {
        const { data: signature } = await axios(browser_download_url);
        platforms.windows = {
          ...platforms.windows,
          ...{
            signature,
          },
        };
      }
    }

    if (params.target === "windows") {
      // s-maxage=120:                data is fresh in 120s
      // stale-while-revalidate=59:   after 1 - 60 data is stale
      //                              during that time, new revalidation request will be made
      res.setHeader(
        "Cache-control",
        "public, s-maxage=120, stale-while-revalidate=59"
      );
      res.status(200).json(platforms.windows);
      return;
    }

    res.status(204).send("No Content");
  } catch (error) {
    res.status(500).send(error);
  }
}
