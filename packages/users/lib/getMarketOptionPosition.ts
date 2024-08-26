import db from '@play-money/database'

// Other Comprehensive Income (OCI) is recorded as Equity. It does not count towards income or net income. Unrealized Gains and Losses from Market Options.
export async function getMarketOptionPosition({ accountId, optionId }: { accountId: string; optionId: string }) {
  const position = await db.marketOptionPosition.findUnique({
    where: {
      accountId_optionId: { accountId, optionId },
    },
  })
  return position
}
