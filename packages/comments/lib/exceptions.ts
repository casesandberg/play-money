export class CommentNotFoundError extends Error {
  static code = 'COMMENT_NOT_FOUND'

  constructor(message = 'Comment not found') {
    super(message)
    this.name = 'CommentNotFoundError'
  }
}
