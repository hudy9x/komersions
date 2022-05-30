import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.PRIVATE_KEY,
});
