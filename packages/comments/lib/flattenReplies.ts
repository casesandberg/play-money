import _ from 'lodash'

const ROOT_KEY = 'ROOT'

export function flattenReplies<C extends { id: string; parentId?: string | null }>(comments: Array<C>) {
  const grouped = _.groupBy(comments, ({ parentId }) => parentId || ROOT_KEY)

  const buildFlatReplies = (comment: C) => {
    let flatReplies: Array<C> = []
    const children = grouped[comment.id] || []

    for (const child of children) {
      flatReplies.push(child)
      flatReplies = flatReplies.concat(buildFlatReplies(child))
    }

    return _.orderBy(flatReplies, 'createdAt', 'asc')
  }

  const topLevelComments = grouped[ROOT_KEY] || []

  return _(topLevelComments)
    .map((comment) => ({
      ...comment,
      replies: buildFlatReplies(comment),
    }))
    .orderBy('createdAt', 'desc')
    .value()
}
