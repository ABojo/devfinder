require("dotenv").config();
const express = require("express");
const { Octokit } = require("octokit");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const app = express();

app.use(express.static("dist"));

app.get("/api/user/:username", async (req, res) => {
  let responseData = {};

  try {
    const { data } = await octokit.request("GET /users/{username}", { username: req.params.username });

    responseData = {
      status: "success",
      data: {
        username: data.login,
        name: data.name,
        bio: data.bio,
        joinDate: data.created_at,
        repos: data.public_repos,
        following: data.following,
        followers: data.followers,
        twitter: data.twitter_username,
        location: data.location,
        company: data.company,
        website: data.blog,
      },
    };
  } catch (err) {
    responseData = { status: "error", code: err.status };

    if (err.status === 404) {
      responseData = { ...responseData, message: "Sorry, that user could not be found!" };
    } else {
      responseData = { ...responseData, message: "Sorry, an error has occured!" };
    }
  }

  res.json(responseData);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is listening for incoming requests!");
});
