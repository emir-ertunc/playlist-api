const trackService = require('../services/trackService');
const { InvalidInputError } = require('../errors');
const { sendOk } = require('../utils/reply');

function readId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new InvalidInputError('id must be a positive integer');
  }
  return id;
}

function list(req, res) {
  const { items, meta } = trackService.list(req.query);
  sendOk(res, items, meta);
}

function getById(req, res) {
  sendOk(res, trackService.getById(readId(req.params.id)));
}

function create(req, res) {
  const track = trackService.create(req.body);
  res.location(`/api/v1/tracks/${track.id}`);
  sendOk(res, track, null, 201);
}

function replace(req, res) {
  sendOk(res, trackService.replace(readId(req.params.id), req.body));
}

function remove(req, res) {
  trackService.remove(readId(req.params.id));
  res.status(204).send();
}

function star(req, res) {
  sendOk(res, trackService.setStar(readId(req.params.id), true));
}

function unstar(req, res) {
  sendOk(res, trackService.setStar(readId(req.params.id), false));
}

function reorder(req, res) {
  sendOk(res, trackService.reorder(req.body && req.body.order));
}

function summary(req, res) {
  sendOk(res, trackService.getSummary());
}

module.exports = { list, getById, create, replace, remove, star, unstar, reorder, summary };
