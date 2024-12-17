import * as baseChrono from 'chrono-node'

// Based on django's slugify:
// https://github.com/django/django/blob/a21a63cc288ba51bcf8c227a49de6f5bb9a72cc3/django/utils/text.py#L362
export function slugifyTitle(title: string, maxLen = 50) {
  let slug = title
    .normalize('NFKD') // Normalize to decomposed form (eg. é -> e)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/[\s]/g, '-') // Replace whitespace with a dash
    .replace(/-+/, '-') // Replace multiple dashes with a single dash

  if (slug.length > maxLen) {
    slug = slug.substring(0, maxLen).replace(/-+[^-]*?$/, '') // Remove the last word, since it might be cut off
  }

  return slug || 'market'
}

const chrono = baseChrono.casual.clone()
chrono.parsers.push(
  // {
  //   pattern: () => {
  //     return /\b20\d{2}\b/i
  //   },
  //   extract: (context, match) => {
  //     console.log(context, match)
  //     const year = parseInt(match[0], 10)
  //     return {
  //       year,
  //       month: 12, // December
  //       day: 31, // 31st
  //     }
  //   },
  // },
  {
    pattern: () => {
      return /\beoy\b/i
    },
    extract: (context, match) => {
      return {
        day: 31,
        month: 12,
      }
    },
  }
)
chrono.refiners.push({
  refine: (context, results) => {
    console.log(context, results)
    results.forEach((result) => {
      const knownValues = result.start.getCertainComponents()

      if (!knownValues.includes('month')) {
        result.start.assign('month', 12)
      }

      if (!knownValues.includes('day')) {
        const lastDay = new Date(result.start.get('year')!, result.start.get('month')!, 0).getDate()
        result.start.assign('day', lastDay)
      }
    })
    return results
  },
})

export function parseQuestionForDate(question: string) {
  // Chrono is unable to parse 2024, 2025, etc. so we replace them with 12/31/2024, 12/31/2025, etc. https://github.com/wanasit/chrono/issues/296
  question = question.replace(/\b20\d{2}\b/g, '12/31/$&')
  return chrono.parseDate(question)
}
