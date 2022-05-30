import axios from "axios";
import type { NextPage } from "next";
import dayjs from "dayjs";
import { LatestVersion } from "../types";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LatestVersion>({
    all_releases: "",
    release_notes: "",
    tag_name: "",
    author: "",
    published_at: "",
    releases: [],
  });

  const {
    all_releases,
    release_notes,
    tag_name,
    author,
    published_at,
    releases,
  } = data;

  useEffect(() => {
    axios(`/api/release/latest`)
      .then(({ data: latestVersion }) => {
        setData(latestVersion);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const published = dayjs(published_at).fromNow();

  return (
    <div className="app">
      <div className="container">
        {loading ? (
          <h2 style={{ textAlign: "center" }}>Loading . . .</h2>
        ) : (
          <>
            <div className="flex item-center justify-between">
              <h1>{author}/{process.env.NEXT_PUBLIC_APP_NAME}</h1>
              <span className="text-gray">{published}</span>
            </div>
            <ul>
              {releases.map((release) => {
                const s = parseFloat(release.size / 1024 / 1024 + "");
                const size = s.toFixed(2);

                const isWin = release.browser_download_url.indexOf(".msi");

                return (
                  <li
                    key={release.name}
                    className="flex item-center justify-between"
                  >
                    <a href={release.browser_download_url}>
                      {/* <span>{isWin ? "win86x64" : ""}</span> */}
                      {release.name}
                    </a>
                    <span className="text-gray-2">{size} mb</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex item-center justify-between">
              <div className="flex item-center gap-2">
                <h4 className="version button-70">{tag_name}</h4>
                <a className="text-gray-3" href={release_notes}>
                  Release Note
                </a>
              </div>
              <a className="text-gray-3" href={all_releases}>
                All Releases
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
