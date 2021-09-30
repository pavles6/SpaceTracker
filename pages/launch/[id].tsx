import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import { getLaunch, getLaunchesIds } from '../../lib/api/api-calls'
import { Launch } from '../../lib/types/api'
import Footer from '../../components/Footer'
import { LaunchHeaderSection } from '../../components/Launch/Header'
import { LaunchOverviewSection } from '../../components/Launch/Overview'
import { LaunchPayloadSection } from '../../components/Launch/Payload'
import { LaunchCrewSection } from '../../components/Launch/Crew'
import { LaunchGallerySection } from '../../components/Launch/Gallery'
import Head from 'next/head'
import { formatDate } from '../../lib/utils/date-functions'
import { usePalette } from '../../lib/palette/store'

interface Props {
  launchData: Launch
}

export default function LaunchPage({ launchData }: Props) {
  const {
    capsules,
    rocket,
    crew,
    date_unix,
    details,
    launchpad,
    links,
    name,
    date_precision,
    payloads,
    success,
    upcoming,
  } = launchData
  const theme = usePalette()

  const isImage = launchData.links!.flickr!.original.length > 0 || null

  const [landingImage, setLandingImage] = useState<string>(
    '/img/default-launch-header.jpg'
  )

  useEffect(() => {
    if (isImage) {
      const randomImage = Math.floor(
        Math.random() * launchData.links.flickr.original.length
      )
      setLandingImage(launchData.links.flickr.original[randomImage])
    }
  }, [])

  let launchOutcome = ''

  if (upcoming) {
    launchOutcome = `Upcoming`
  }

  if (success) launchOutcome = 'Successful'
  if (success === false) launchOutcome = 'Failed'

  let dateFormat
  let formattedDate = 'N/A'

  switch (date_precision) {
    case 'hour':
    case 'day':
      dateFormat = 'MMMM D, YYYY.'
      break
    case 'month':
      dateFormat = 'MMMM, YYYY.'
      break
    case 'half':
    case 'quarter':
    case 'year':
      dateFormat = 'YYYY.'
      break
    default:
      dateFormat = null
  }

  if (dateFormat)
    formattedDate = formatDate(new Date(date_unix * 1000), dateFormat)

  return (
    <>
      <Head>
        <title>{`${launchData.name} | SpaceXplorer`}</title>
      </Head>
      <Navbar />
      <div>
        <LaunchHeaderSection
          success={success}
          isCrew={crew.length > 0}
          upcoming={upcoming}
          formattedDate={formattedDate}
          landingImageUrl={landingImage}
          launchOutcome={launchOutcome}
          name={name}
        />
        <div className={`${theme.base.surfaceBackground}`}>
          <div
            className={`${theme.base.surfaceBackground} flex flex-col items-center w-full`}
          >
            <article
              className={`flex flex-col max-w-screen-xl w-11/12 lg:w-full lg:px-6 h-full space-y-12 my-8`}
            >
              <LaunchOverviewSection
                formattedDate={formattedDate}
                launchOutcome={launchOutcome}
                upcoming={upcoming}
                launchpadRegion={launchpad.region}
                launchpadName={launchpad.name}
                launchpadId={launchpad.id}
                rocketName={rocket.name}
                rocketWikipediaPage={rocket.wikipedia}
                name={name}
                details={details}
                links={links}
              />
              <LaunchPayloadSection capsules={capsules} payloads={payloads} />
              {crew.length > 0 ? <LaunchCrewSection crew={crew} /> : null}
            </article>

            {links.flickr.original.length > 0 ? (
              <LaunchGallerySection
                name={name}
                images={links.flickr.original}
              />
            ) : null}
            <Footer />
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  const launchData = await getLaunch(params.id)

  return {
    props: {
      launchData,
    },
    revalidate: 10,
  }
}

export async function getStaticPaths() {
  const docs = await getLaunchesIds()

  const paths = docs.map((doc: any) => ({ params: { id: doc.id } }))

  return {
    paths,
    fallback: true,
  }
}
