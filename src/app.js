const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./docs/openapi');
const trackRoutes = require('./routes/trackRoutes');
const { ApiError } = require('./errors');
const { sendFail } = require('./utils/reply');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api/v1/tracks', trackRoutes);

app.use((req, res) => {
  sendFail(res, 404, 'Route not found');
});

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return sendFail(res, err.status, err.message);
  }
  if (err.type === 'entity.parse.failed') {
    return sendFail(res, 400, 'Invalid JSON body');
  }
  console.error(err);
  sendFail(res, 500, 'Internal server error');
});

module.exports = app;
