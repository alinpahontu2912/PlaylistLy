import * as spotifyService from './spotify';
import * as tidalService from './tidal';

const RATE_LIMIT_DELAY = 350; // ms between search requests

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getService(platform) {
  return platform === 'spotify' ? spotifyService : tidalService;
}

function cleanTitle(title) {
  let cleaned = title;
  cleaned = cleaned.replace(/\s*\(.*?(feat\.|ft\.|featuring).*?\)/gi, '');
  cleaned = cleaned.replace(/\s*\[.*?(feat\.|ft\.|featuring).*?\]/gi, '');
  cleaned = cleaned.replace(/\s*\(.*?remaster(ed)?.*?\)/gi, '');
  cleaned = cleaned.replace(/\s*\[.*?remaster(ed)?.*?\]/gi, '');
  cleaned = cleaned.replace(/\s*\(.*?remix.*?\)/gi, '');
  cleaned = cleaned.replace(/\s*\[.*?remix.*?\]/gi, '');
  cleaned = cleaned.replace(/\s*\(.*?album.*?version.*?\)/gi, '');
  cleaned = cleaned.replace(/\s*\[.*?album.*?version.*?\]/gi, '');
  cleaned = cleaned.replace(/\s*\(.*?deluxe.*?\)/gi, '');
  cleaned = cleaned.replace(/\s*\[.*?deluxe.*?\]/gi, '');
  cleaned = cleaned.replace(/\s*[-–—]\s*(feat\.|ft\.).*$/gi, '');
  return cleaned.trim();
}

function deduplicateSongs(songs) {
  const seen = new Set();
  return songs.filter((song) => {
    const key = `${song.title.toLowerCase()}|${song.artists[0]?.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function matchSongs(targetService, songs, onProgress) {
  const matched = [];
  const notFound = [];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];

    if (onProgress) {
      onProgress({
        phase: 'matching',
        current: i + 1,
        total: songs.length,
        currentItem: `${song.title} — ${song.artists[0] || ''}`,
      });
    }

    try {
      let result = await targetService.searchTrack(song.title, song.artists);

      // Retry with cleaned title if not found
      if (!result) {
        const cleaned = cleanTitle(song.title);
        if (cleaned !== song.title) {
          result = await targetService.searchTrack(cleaned, song.artists);
        }
      }

      if (result) {
        matched.push({
          title: song.title,
          artists: song.artists,
          targetId: result.id,
          targetUri: result.uri || null,
        });
      } else {
        notFound.push({
          title: song.title,
          artists: song.artists,
          reason: 'Not available in catalog',
        });
      }
    } catch (err) {
      notFound.push({
        title: song.title,
        artists: song.artists,
        reason: err.message || 'Search failed',
      });
    }

    await delay(RATE_LIMIT_DELAY);
  }

  return { matched, notFound };
}

export async function transferContent(
  sourcePlatform,
  targetPlatform,
  selection,
  onProgress,
) {
  const source = getService(sourcePlatform);
  const target = getService(targetPlatform);
  const allSuccess = [];
  const allFailed = [];

  // --- Phase 1: Fetch songs from source ---

  let allSongsToTransfer = [];

  if (selection.likedSongs) {
    onProgress({
      phase: 'fetching',
      current: 0,
      total: 0,
      currentItem: 'Liked songs',
    });

    const liked = await source.getLikedSongs((current, total) => {
      onProgress({
        phase: 'fetching',
        current,
        total,
        currentItem: 'Liked songs',
      });
    });

    allSongsToTransfer.push({ type: 'liked', songs: liked });
  }

  for (const playlist of selection.playlists) {
    onProgress({
      phase: 'fetching',
      current: 0,
      total: playlist.trackCount,
      currentItem: playlist.name,
    });

    const tracks = await source.getPlaylistTracks(
      playlist.id,
      (current, total) => {
        onProgress({
          phase: 'fetching',
          current,
          total,
          currentItem: playlist.name,
        });
      },
    );

    allSongsToTransfer.push({
      type: 'playlist',
      name: playlist.name,
      songs: tracks,
    });
  }

  // --- Phase 2 & 3: Match and save for each content group ---

  for (const group of allSongsToTransfer) {
    const uniqueSongs = deduplicateSongs(group.songs);
    const { matched, notFound } = await matchSongs(
      target,
      uniqueSongs,
      onProgress,
    );

    // Save to target
    onProgress({
      phase: 'saving',
      current: 0,
      total: matched.length,
      currentItem: group.type === 'liked' ? 'Liked songs' : group.name,
    });

    try {
      if (group.type === 'liked') {
        const ids = matched.map((m) => m.targetId);
        await target.saveTracks(ids);
      } else {
        // Create playlist and add tracks
        const user = await target.getCurrentUser();
        const newPlaylistId = await target.createPlaylist(
          user.id,
          group.name,
          `Transferred from ${sourcePlatform} by PlaylistLy`,
        );

        if (targetPlatform === 'spotify') {
          const uris = matched.map((m) => m.targetUri);
          await target.addTracksToPlaylist(newPlaylistId, uris);
        } else {
          const ids = matched.map((m) => m.targetId);
          await target.addTracksToPlaylist(newPlaylistId, ids);
        }
      }
    } catch (err) {
      console.error('Failed to save tracks:', err);
      // Move matched songs to failed with save error
      for (const song of matched) {
        allFailed.push({
          title: song.title,
          artists: song.artists,
          reason: `Save failed: ${err.message}`,
        });
      }
      allFailed.push(...notFound);
      continue;
    }

    onProgress({
      phase: 'saving',
      current: matched.length,
      total: matched.length,
      currentItem: group.type === 'liked' ? 'Liked songs' : group.name,
    });

    allSuccess.push(
      ...matched.map((m) => ({
        title: m.title,
        artist: m.artists.join(', '),
      })),
    );
    allFailed.push(
      ...notFound.map((n) => ({
        title: n.title,
        artist: n.artists.join(', '),
        reason: n.reason,
      })),
    );
  }

  return {
    success: allSuccess,
    failed: allFailed,
    total: allSuccess.length + allFailed.length,
  };
}
