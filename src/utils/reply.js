function sendOk(res, data, meta, status = 200) {
  const body = { ok: true, data };
  if (meta) body.meta = meta;
  res.status(status).json(body);
}

function sendFail(res, status, message) {
  res.status(status).json({ ok: false, error: { message } });
}

module.exports = { sendOk, sendFail };
