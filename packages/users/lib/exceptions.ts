export class UserNotFoundError extends Error {
  static code = 'USER_NOT_FOUND'

  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}
