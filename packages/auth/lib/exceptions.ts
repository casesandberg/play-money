export class UserExistsError extends Error {
  constructor(message = 'User with that email already exists') {
    super(message)
    this.name = 'UserExistsError'
  }
}
