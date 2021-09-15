import React, { useEffect, useState } from 'react'
import { Router, useRouter } from 'next/router'
import Text from '../Text/Text'
import { INavItem, navItems } from './NavItems'
import Button from '../Button/Button'
import { MenuIcon } from '@heroicons/react/outline'
import { Drawer } from './Drawer'
import Link from 'next/link'
import { usePalette } from '../../lib/palette/store'
import { useTheme } from 'next-themes'
import { ThemeSwitch } from './ThemeSwitch'

interface Props {
  backgroundColor?: string
  isShadow?: boolean
}

export default function Navbar({ backgroundColor, isShadow = true }: Props) {
  const router = useRouter()

  const theme = usePalette()

  const { theme: themeType, setTheme } = useTheme()

  const [menuOpened, setMenuOpened] = useState(false)

  const [mounted, setMounted] = useState(false)

  let shadow = 'shadow-md'
  if (!isShadow) shadow = 'no-shadow'

  if (!backgroundColor) backgroundColor = theme.base.surface

  const [navbarLinks, setNavbarLinks] = useState<INavItem[]>([...navItems])

  function checkForActiveLinks() {
    const links = [...navbarLinks]

    links.map((link, i) =>
      router.asPath === link.path
        ? (links[i].active = true)
        : (links[i].active = false)
    )

    setNavbarLinks([...links])
  }

  useEffect(() => {
    setMounted(true)
    checkForActiveLinks()
  }, [])

  useEffect(() => {
    if (window && menuOpened) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
  }, [menuOpened])

  return (
    <>
      <nav
        className={`w-full ${shadow} ${backgroundColor} transition h-16 ${
          router.pathname == '/' ? 'fixed' : 'sticky'
        } top-0 right-0 flex lg:justify-between items-center z-40 flex-row`}
      >
        <Button
          icon={MenuIcon}
          buttonClasses="mx-2 lg:hidden transition"
          click={() => {
            setMenuOpened(true)
          }}
        />
        <Text
          link
          href="/"
          size="text-2xl"
          weight="font-bold"
          classes={`lg:ml-2 lg:text-4xl ${theme.base.textPrimary}`}
        >
          SpaceXplorer
        </Text>

        <div className="hidden lg:flex flex-1 flex-row items-center h-10 justify-end space-x-5">
          {mounted
            ? navbarLinks.map((link) => {
                return (
                  <Link key={link.title} href={link.path}>
                    <a
                      className={`flex items-center justify-center  transition duration-150 ${
                        link.active ? 'pointer-events-none cursor-default' : ''
                      }`}
                    >
                      <Text
                        classes={`font-semibold uppercase ${
                          link.active
                            ? theme.base.textPrimary
                            : theme.base.textAccent
                        } ${
                          link.active
                            ? ''
                            : themeType === 'light'
                            ? `hover:${theme.base['dark:textSecondary']}`
                            : `dark:hover:${theme.base['light:textSecondary']}`
                        }`}
                      >
                        {link.title}
                      </Text>
                    </a>
                  </Link>
                )
              })
            : null}
        </div>
        <ThemeSwitch theme={theme} themeType={themeType} setTheme={setTheme} />
      </nav>
      <Drawer
        closeMenu={() => setMenuOpened(false)}
        navLinks={navbarLinks}
        open={menuOpened}
      />
    </>
  )
}
