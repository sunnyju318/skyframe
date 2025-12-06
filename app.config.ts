// Expo configuration with environment variables
import "dotenv/config";

export default {
  expo: {
    name: "SkyFrame",
    slug: "skyframe",
    version: "1.0.0",
    platforms: ["ios", "android"],
    extra: {
      blueskyIdentifier: process.env.BLUESKY_IDENTIFIER,
      blueskyPassword: process.env.BLUESKY_PASSWORD,
    },
  },
};
