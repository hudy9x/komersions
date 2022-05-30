import axios from "axios";
import type { NextPage } from "next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LatestVersion } from "../types";

dayjs.extend(relativeTime);

const Home: NextPage<LatestVersion> = ({
  all_releases,
  release_notes,
  tag_name,
  author,
  published_at,
  releases,
}) => {
  const published = dayjs(published_at).fromNow();

  return (
    <div className="app">
      <div className="container">
        <div className="flex item-center justify-between">
          <h1>{author}/kompad</h1>
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
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const { data: latestVersion } = await axios(
    `${process.env.URL}/api/release/latest`
  );

  return {
    props: latestVersion,
    revalidate: 30,
  };
}

export default Home;
