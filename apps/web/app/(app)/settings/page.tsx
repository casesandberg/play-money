import { put } from '@vercel/blob'
import { redirect } from 'next/navigation'
import { auth } from '@play-money/auth'
import { SettingsProfileForm } from '@play-money/users/components/SettingsProfileForm'

const HAS_IMAGE_UPLOAD = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export default async function AppSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login?redirect=/settings')
  }

  async function uploadImage(formData: FormData) {
    'use server'

    const imageFile = formData.get('image') as File
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
    })
    return blob.url
  }

  return (
    <div>
      <SettingsProfileForm hasImageUpload={HAS_IMAGE_UPLOAD} onImageUpload={uploadImage} />
    </div>
  )
}
