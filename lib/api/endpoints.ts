import { AxiosRequestConfig } from 'axios'
import { QueryObject, QueryTypes } from '../types/query'
import { IEndpointPayload } from './IEndpoints'

interface RequestConfig extends AxiosRequestConfig {
  data?: IEndpointPayload
}

export const launchPayload = (id: string): RequestConfig => ({
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/launches/query',
  data: {
    options: {
      pagination: false,
      select:
        'date_unix date_precision name upcoming success details rocket links.wikipedia links.article links.webcast links.reddit.campaign links.reddit.launch links.flickr.original crew capsules payloads launchpad landpad id',
      populate: [
        {
          path: 'rocket',
          select: 'name id wikipedia',
        },
        {
          path: 'crew',
          select: 'name agency image wikipedia launches id',
        },
        {
          path: 'capsules',
          select:
            'serial type id last_update status reuse_count water_landings land_landings',
        },
        {
          path: 'launchpad',
          select: 'locality region name id',
        },
        {
          path: 'payloads',
          select: 'id name type reused customers nationalities manufacturers ',
          populate: [
            {
              path: 'dragon.capsule',
              select:
                'capsule, flight_time_sec,mass_returned_kg,mass_returned_lbs,water_landing,land_landing',
            },
          ],
        },
      ],
    },
    query: {
      _id: id,
    },
  },
})

export const dragonsPreviewPayload: RequestConfig = {
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/dragons/query',
  data: {
    options: {
      pagination: false,
      select: 'name flickr_images active first_flight description id',
    },
  },
}

export const rocketsPreviewPayload: RequestConfig = {
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/rockets/query',
  data: {
    options: {
      pagination: false,
      select:
        'name id flickr_images description engines.number first_flight active',
    },
  },
}

export const recentLaunchesPayload: RequestConfig = {
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/launches/query',
  data: {
    options: {
      limit: 5,
      select: 'date_unix date_precision name id upcoming success rocket crew',
      sort: {
        date_unix: 'desc',
      },
      populate: [{ path: 'rocket', select: 'name' }],
    },
    query: {
      upcoming: {
        $eq: false,
      },
      date_precision: {
        $eq: 'hour',
      },
    },
  },
}

export const nextLaunchPayload: RequestConfig = {
  method: 'GET',
  url: 'https://api.spacexdata.com/v4/launches/next',
}

export const LaunchesIdsPayload: RequestConfig = {
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/launches/query',
  data: {
    options: {
      pagination: false,
      select: 'id',
    },
  },
}

export const RocketTypesPayload: RequestConfig = {
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/rockets/query',
  data: {
    options: {
      pagination: false,
      select: 'name',
    },
  },
}

export const PayloadTypesPayload: RequestConfig = {
  method: 'POST',
  url: 'https://api.spacexdata.com/v4/payloads/query',
  data: {
    options: {
      pagination: false,
      select: 'type',
    },
  },
}

export const queryLaunchesPayload = (query: QueryObject): RequestConfig => {
  const mongoQuery = {} as any
  const sort = {} as any
  const populate = [{ path: 'rocket', select: 'name' }] as any

  const {
    q,
    date_range,
    has_images,
    launch_type,
    outcome,
    payload_type,
    rocket,
  } = query

  if (q)
    mongoQuery.name = {
      $regex: q,
      $options: 'i',
    }

  if (date_range) {
    if (date_range === 'newest') {
      mongoQuery.upcoming = {
        $eq: false,
      }
      sort.date_unix = 'desc'
    } else if (date_range === 'upcoming') {
      ;(mongoQuery.upcoming = {
        $eq: true,
      }),
        (sort.date_unix = 'asc')
    } else if (date_range === 'oldest') {
      mongoQuery.upcoming = {
        $eq: false,
      }
      sort.date_unix = 'asc'
    } else {
      const range = date_range.split('_')
      if (range.length === 2) {
        mongoQuery.date_unix = {
          $gte: (new Date(range[0]) as any) / 1000,
          $lt: (new Date(range[1]) as any) / 1000,
        }
        sort.date_unix = 'asc'
      }
    }
  }

  if (has_images)
    mongoQuery['links.flickr.original.1'] = {
      $exists: true,
    }

  if (launch_type === 'crew')
    mongoQuery['crew.1'] = {
      $exists: true,
    }

  if (launch_type === 'non-crew')
    mongoQuery['crew.1'] = {
      $exists: false,
    }

  if (outcome === 'successful')
    mongoQuery.success = {
      $eq: true,
    }

  if (outcome === 'failed')
    mongoQuery.success = {
      $eq: false,
    }

  if (payload_type) {
    populate.push({
      path: 'payloads',
      match: { type: payload_type },
    })

    mongoQuery.payloads = {
      $exists: true,
      $not: {
        $size: 0,
      },
    }
  }

  if (rocket) {
    populate.push({
      path: 'rocket',
      match: { name: rocket },
      select: 'name',
    })
  }

  return {
    method: 'POST',
    url: 'https://api.spacexdata.com/v4/launches/query',
    data: {
      options: {
        limit: 12,
        page: query.page || 1,
        select: 'name id date_unix date_precision success crew rocket upcoming',
        sort,
        populate,
      },
      query: mongoQuery,
    },
  }
}
