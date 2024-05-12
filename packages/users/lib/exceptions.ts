export class UserNotFoundError extends Error {
  static code = 'USER_NOT_FOUND'

  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

export class UserExistsError extends Error {
  constructor(message = 'User with that email already exists') {
    super(message)
    this.name = 'UserExistsError'
  }
}
