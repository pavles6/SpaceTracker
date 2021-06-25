import React, { ReactElement, useEffect, useState } from 'react'
import { CrewMember } from '../../lib/types/api'
import { Transition } from '@headlessui/react'
import Text from '../Text/Text'
import { useSelector } from 'react-redux'
import { State } from '../../lib/types/redux'
import { useMediaQuery } from 'react-responsive'
import Image from 'next/image'

interface Props extends CrewMember {
  key: React.Key
}

export default function CrewMemberCard({
  name,
  wikipedia,
  launches,
  agency,
  image,
}: Props): ReactElement {
  const [showMemberInfo, setShowMemberInfo] = useState(false)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isSmallScreen = useMediaQuery({ query: '(max-width: 767px)' })

  return (
    <div
      tabIndex={0}
      className="w-64 h-64 my-8 md:mx-8 mb-0 flex relative shadow-md rounded-xl"
    >
      <Image
        layout="fill"
        objectFit="cover"
        src={image}
        alt={`${name}, ${agency}`}
        className="w-full relative h-full rounded-xl"
      />
      <div
        onMouseOver={() => setShowMemberInfo(true)}
        onMouseLeave={() => setShowMemberInfo(false)}
        className={`absolute flex flex-col w-full h-full
        `}
      >
        <Transition
          show={showMemberInfo || (isSmallScreen && isClient)}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="flex w-full h-full flex-col justify-center items-center spacing-y-5 rounded-xl
          bg-black bg-opacity-60 transition"
        >
          <Text
            classes="text-xl md:text-2xl"
            weight="font-semibold"
            color="mainText"
            align="text-center"
          >
            {name}
          </Text>
          <Text classes="sm:text-base md:text-lg" color="textAccent">
            {`Agency: ${agency}`}
          </Text>
          <Text classes="sm:text-base md:text-lg" color="textAccent">
            {`No. of missions: ${launches.length}`}
          </Text>
          {wikipedia ? (
            <Text
              target="__blank"
              classes="sm:text-base md:text-lg"
              decoration="underline"
              color="mainText"
              weight="font-semibold"
              link
              href={wikipedia}
            >
              Wikipedia page
            </Text>
          ) : null}
        </Transition>
      </div>
    </div>
  )
}