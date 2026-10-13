function formatLength(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function toTrackDto(track, position) {
  return {
    id: track.id,
    position,
    title: track.title,
    artist: track.artist,
    album: track.album,
    length: track.length,
    lengthText: formatLength(track.length),
    genre: track.genre,
    cover: track.cover,
    starred: track.starred
  };
}

module.exports = { toTrackDto, formatLength };
