import { createClient } from '@/lib/supabase'

export default async function sitemap() {
  const supabase = createClient()
  const { data } = await supabase
    .from('bills')
    .select('sponsor_bioguide_id')
    .not('sponsor_bioguide_id', 'is', null)

  const bioguideIds = [...new Set((data ?? []).map((b: { sponsor_bioguide_id: string }) => b.sponsor_bioguide_id))]

  const repPages = bioguideIds.map((id) => ({
    url: `https://whokilledthebill.com/rep/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://whokilledthebill.com', lastModified: new Date(), priority: 1.0 },
    { url: 'https://whokilledthebill.com/leaderboard', lastModified: new Date(), priority: 0.9 },
    { url: 'https://whokilledthebill.com/faq', lastModified: new Date(), priority: 0.6 },
    { url: 'https://whokilledthebill.com/methodology', lastModified: new Date(), priority: 0.6 },
    ...repPages,
  ]
}