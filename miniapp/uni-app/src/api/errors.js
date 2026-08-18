export class ApiError extends Error {
  constructor(code, message, statusCode = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
  }

  static fromEnvelope(envelope) {
    return new ApiError(envelope.code, envelope.message)
  }
}
