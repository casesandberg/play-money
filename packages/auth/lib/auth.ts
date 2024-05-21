import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { generateFromEmail } from 'unique-username-generator'
import db, { UserSchema } from '@play-money/database'

const prismaAdapter = PrismaAdapter(db)

// Override prisma adapter to add required fields to user creation
prismaAdapter.createUser = ({ id: _id, ...data }) => {
  const identifier = generateFromEmail(data.email, 4)
  return prisma.user.create({ data: { ...data, username: identifier, displayName: identifier } })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: prismaAdapter,
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/check-email',
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Resend({
      from: 'case@casesandberg.com',
    }),
    // Credentials({
    //   name: 'Email',
    //   credentials: {
    //     email: { label: 'Email', type: 'email' },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   authorize: async (credentials) => {
    //     const { email, password } = UserSchema.pick({ email: true, password: true }).parse(credentials)

    //     const user = await db.user.findUnique({
    //       where: {
    //         email,
    //       },
    //     })

    //     if (!user) {
    //       throw new Error('User not found.')
    //     }

    //     const isValidPassword = await bcrypt.compare(password, user.password)

    //     if (!isValidPassword) {
    //       throw new Error('User not found.')
    //     }

    //     return {
    //       id: user.id,
    //       email: user.email,
    //       username: user.username,
    //     }
    //   },
    // }),

    // async signIn({ user, account, email }) {
    //   await db.connect();
    //   const userExists = await User.findOne({
    //     email: user.email,  //the user object has an email property, which contains the email the user entered.
    //   });
    //   if (userExists) {
    //     return true;   //if the email exists in the User collection, email them a magic login link
    //   } else {
    //     return "/register";
    //   }
    // },
  ],
})
