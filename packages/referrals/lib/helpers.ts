export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
