import OpenAI from 'openai'
import { slugifyTitle } from './helpers'

// Market tag completion is completely optional. Returns an empty array if no OpenAI key set.
export async function getMarketTagsLLM({ question }: { question: string }) {
  try {
    if (!process.env['OPENAI_API_KEY']) {
      throw new Error('No key')
    }
    const client = new OpenAI()

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Given a title of a question, please generate 4 tags that can be used to associate this question in a tag system. The first tag should be very broad and each subsequent one should increase in specificity. Use common vocabulary to increase overlap in tag names. Return as an array of strings as json. Question: ${question}`,
        },
      ],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
    })

    const content = chatCompletion.choices[0].message.content
      ? JSON.parse(chatCompletion.choices[0].message.content)
      : {}

    if (content.tags && Array.isArray(content.tags)) {
      return content.tags.map((tag: string) => slugifyTitle(tag)) as Array<string>
    }

    return []
  } catch (error) {
    if ((error as Response).status === 429) {
      console.log('OpenAI insufficient funds')
    }
    // No key no problem :)
    return []
  }
}
