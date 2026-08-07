import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const fixtureFiles = new Map([
  ['/tunasync_status.json', 'mock/tunasync_status.json'],
  ['/static/res_link.json', 'mock/static/res_link.json'],
  ['/help_list.json', 'mock/help_list.json'],
])

const mirrorUpdateAges = [
  30,
  2 * 60,
  10 * 60,
  45 * 60,
  2 * 60 * 60,
  8 * 60 * 60,
  24 * 60 * 60,
  3 * 24 * 60 * 60,
  14 * 24 * 60 * 60,
  45 * 24 * 60 * 60,
]

const formatTunasyncTime = (timestamp) => {
  return `${new Date((timestamp + 8 * 60 * 60) * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19)} +0800`
}

const createFixtureContents = async (publicPath, source) => {
  const contents = await readFile(resolve(appRoot, source))

  if (publicPath !== '/tunasync_status.json') {
    return contents
  }

  const now = Math.floor(Date.now() / 1000)
  const mirrors = JSON.parse(contents.toString())

  return JSON.stringify(
    mirrors.map((mirror, index) => {
      const lastUpdate = now - mirrorUpdateAges[index % mirrorUpdateAges.length]

      return {
        ...mirror,
        last_update: formatTunasyncTime(lastUpdate),
        last_update_ts: lastUpdate,
      }
    }),
    null,
    2,
  )
}

const copyFixtures = async (outputRoot) => {
  for (const [publicPath, source] of fixtureFiles) {
    const target = resolve(outputRoot, publicPath.slice(1))
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, await createFixtureContents(publicPath, source))
  }
}

export default function mockDataIntegration() {
  return {
    name: '@hitszosa/mirrors-mock-data',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://localhost')
            .pathname
          const fixture = fixtureFiles.get(pathname)

          if (!fixture) {
            next()
            return
          }

          try {
            response.statusCode = 200
            response.setHeader(
              'Content-Type',
              'application/json; charset=utf-8',
            )
            response.end(await createFixtureContents(pathname, fixture))
          } catch (error) {
            next(error)
          }
        })

        logger.info('Serving bundled mirror fixtures without modifying public/')
      },
      'astro:build:done': async ({ dir, logger }) => {
        await copyFixtures(fileURLToPath(dir))
        logger.info('Copied bundled mirror fixtures to the build output')
      },
    },
  }
}
