/**
 * Spotify Feature - API Routes
 * Proxy for Spotify API search and track details with token caching
 */

import { Hono } from "hono";

const spotifyRoutes = new Hono();

// In-memory token cache
let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

/**
 * Helper to get Spotify Access Token via Client Credentials Flow
 */
async function getSpotifyToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials missing in environment variables");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Spotify Auth Error:", error);
    throw new Error("Failed to authenticate with Spotify");
  }

  const data = await response.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

/**
 * GET /api/spotify/search
 * Search for tracks on Spotify
 */
spotifyRoutes.get("/search", async (c) => {
  const query = c.req.query("q");
  if (!query) {
    return c.json({ success: false, error: "Search query required" }, 400);
  }

  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Spotify search request failed");
    }

    const data = await response.json();
    const tracks = data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      imageUrl: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
    }));

    return c.json({ success: true, data: tracks });
  } catch (error) {
    console.error("Spotify Search error:", error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/spotify/tracks/:id
 * Get details for a specific track
 */
spotifyRoutes.get("/tracks/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ success: false, error: "Track not found" }, 404);
      }
      throw new Error("Spotify track request failed");
    }

    const track = await response.json();
    const data = {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      imageUrl: track.album.images[0]?.url,
      externalUrl: track.external_urls.spotify,
    };

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Spotify Track Details error:", error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default spotifyRoutes;
