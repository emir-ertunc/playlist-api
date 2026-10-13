const { loadSeedTracks } = require('../data/seed');

// everything lives in memory and is reset on restart
let tracks = loadSeedTracks();

function all() {
  return tracks;
}

function find(id) {
  return tracks.find((t) => t.id === id);
}

function insert(track) {
  tracks.push(track);
  return track;
}

function modify(id, changes) {
  const track = find(id);
  if (!track) return undefined;
  Object.assign(track, changes);
  return track;
}

function destroy(id) {
  const index = tracks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tracks.splice(index, 1);
  return true;
}

function setOrder(newList) {
  tracks = newList;
}

module.exports = { all, find, insert, modify, destroy, setOrder };
