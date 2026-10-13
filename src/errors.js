class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class InvalidInputError extends ApiError {
  constructor(message) {
    super(message, 400);
  }
}

class MissingError extends ApiError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = { ApiError, InvalidInputError, MissingError };
