import { Octokit } from "octokit";

export const octokit = new Octokit({
  // Generate Private Key refers to: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
  // Note that: current key is Tokens (classic) not Fine-grained tokens
  auth: process.env.PRIVATE_KEY,
});
