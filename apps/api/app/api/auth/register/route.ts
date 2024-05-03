import db, { _UserModel } from '@play-money/database'
import bcrypt from 'bcryptjs'
import { generateFromEmail } from 'unique-username-generator'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json()
    const { email, password } = _UserModel.pick({ email: true, password: true }).parse(body)

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return new Response('User already exists', { status: 409 })
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    const user = await db.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: generateFromEmail(email, 3),
      },
    })

    return new Response(
      JSON.stringify({
        message: 'User created successfully',
        user: { id: user.id, email: user.email },
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Request error', error)
    return new Response('Error processing request', { status: 500 })
  }
}
