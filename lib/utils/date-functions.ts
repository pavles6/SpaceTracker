import moment from 'moment'

export function formatDate(date: Date, format: string): string {
  if (!moment(Date.now(), format).isValid()) {
    throw new Error(`Invalid date format > ${format}`)
  }

  return moment(date).format(format)
}

interface CountdownReturnObject {
  days: string
  hours: string
  minutes: string
  seconds: string
}

// this fn is supposed to be called in 1s interval
export function calculateCountdown(
  date_unix: number
): CountdownReturnObject | null {
  const now = new Date().getTime()
  const distance = date_unix * 1000 - now

  if (distance > 0) {
    let days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString()
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ).toString()
    let minutes = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    ).toString()
    let seconds = Math.floor((distance % (1000 * 60)) / 1000).toString()

    if (days.length == 1) days = `0${days}`
    if (hours.length == 1) hours = `0${hours}`
    if (minutes.length == 1) minutes = `0${minutes}`
    if (seconds.length == 1) seconds = `0${seconds}`

    return {
      days,
      hours,
      minutes,
      seconds,
    }
  } else {
    return null
  }
}