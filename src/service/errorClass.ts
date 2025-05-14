export { DataNotExistError, UnauthorizedError ,ForbiddenError, NotFoundError,ConflictError, InternalServerError, FuctionExecutionError};


class DataNotExistError extends Error {
    code: number;
    constructor(...args:any) {
      super(...args)
      this.code = 404
      this.name = 'DataNotExistError'
      this.stack = `${this.message}\n${new Error().stack}`
    }
}

class UnauthorizedError extends Error {
    code: number;
    constructor(...args:any) {
      super(...args)
      this.code = 401
      this.name = 'UnauthorizedError'
      this.stack = `${this.message}\n${new Error().stack}`
    }
}

class NotFoundError extends Error {
    code: number;
    constructor(...args:any) {
      super(...args)
      this.code = 404
      this.name = 'NotFoundError'
      this.stack = `${this.message}\n${new Error().stack}`
    }
}

class ConflictError extends Error {
  code: number;
  constructor(...args:any) {
    super(...args)
    this.code = 409
    this.name = 'ConflictError'
    this.stack = `${this.message}\n${new Error().stack}`
  }
}

class InternalServerError extends Error {
    code: number;
    constructor(...args:any) {
      super(...args)
      this.code = 500
      this.name = 'InternalServerError'
      this.stack = `${this.message}\n${new Error().stack}`
    }
}

class FuctionExecutionError extends Error {
    code: number;
    constructor(...args:any) {
      super(...args)
      this.code = 500
      this.name = 'FuctionExecutionError'
      this.stack = `${this.message}\n${new Error().stack}`
    }
}


class ForbiddenError extends Error {
  code: number;
  constructor(...args:any) {
    super(...args)
    this.code = 403
    this.name = 'ForbiddenError'
    this.stack = `${this.message}\n${new Error().stack}`
  }
}
