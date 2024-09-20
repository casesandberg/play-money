import { formatDistanceToNow } from 'date-fns'

export function formatDistanceToNowShort(date: Date | number): string {
  const formatted = formatDistanceToNow(date, { addSuffix: true })

  return formatted
    .replace(/\sabout\s/, '')
    .replace(/\sless than\s/, '<')
    .replace(/\sover\s/, '>')
    .replace(/\syears?/, 'y')
    .replace(/\smonths?/, 'mo')
    .replace(/\sweeks?/, 'w')
    .replace(/\sdays?/, 'd')
    .replace(/\shours?/, 'h')
    .replace(/\sminutes?/, 'm')
    .replace(/\sseconds?/, 's')
    .replace(/^in\s?/, '')
    .replace(/^about\s?/, '')
    .replace(/\sago/, '')
    .trim()
}
