import Link from "next/link"
import { HeroBackground } from "@/components/hero-background"
import { auth } from "@/auth"
import { GetStartedButton } from "@/components/get-started-button"
import { LandingPage } from "@/components/landing-page"
import { VoteSite } from "@/components/voting-section"

import { getImages } from "@/app/actions/upload-image"

async function getBannerImages() {
  try {
    const res = await getImages("banner")
    if (res.success && res.data) {
      return res.data.map(img => img.url).sort(() => Math.random() - 0.5)
    }
    return []
  } catch (error) {
    console.error("Failed to fetch banner images form S3:", error)
    return []
  }
}

async function getCommunityImages() {
  try {
    const res = await getImages("featuredBuilds")
    if (res.success && res.data) {
      return res.data.map(img => img.url).sort(() => Math.random() - 0.5)
    }
    return []
  } catch (error) {
    console.error("Failed to fetch community images from S3:", error)
    return []
  }
}

function getVotingSites(): VoteSite[] {
  const jsonStr = process.env.VOTING_SITES_JSON
  if (jsonStr) {
    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      console.error("Failed to parse VOTING_SITES_JSON", e)
    }
  }
  // Default fallback if env not set
  return [
    { name: "Planet Minecraft", url: "#" },
    { name: "TopG", url: "#" },
    { name: "Minecraft Server List", url: "#" }
  ]
}

import { getEvents, getEventTypeInfos } from "@/app/actions/events"
import { Footer } from "@/components/footer"

// ...

export default async function Home() {
  const bannerImages = await getBannerImages()
  const communityImages = await getCommunityImages()
  const votingSites = getVotingSites()
  const session = await auth()
  const eventsResult = await getEvents()
  const templatesResult = await getEventTypeInfos()
  const events = eventsResult.success && eventsResult.data ? eventsResult.data : []
  const templates = templatesResult.success && templatesResult.data ? templatesResult.data : []

  return (
    <div className="flex min-h-screen flex-col">
      <LandingPage
        bannerImages={bannerImages}
        user={session?.user}
        communityImages={communityImages}
        votingSites={votingSites}
        events={events}
        eventTemplates={templates}
      />

      <Footer />
    </div>
  )
}
