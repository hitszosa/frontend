import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const fixtureFiles = new Map([
  ['/tunasync_status.json', 'mock/tunasync_status.json'],
  ['/static/res_link.json', 'mock/static/res_link.json'],
  ['/help_list.json', 'mock/help_list.json'],
])

const copyFixtures = async (outputRoot) => {
  for (const [publicPath, source] of fixtureFiles) {
    const target = resolve(outputRoot, publicPath.slice(1))
    await mkdir(dirname(target), { recursive: true })
    await copyFile(resolve(appRoot, source), target)
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
            response.end(await readFile(resolve(appRoot, fixture)))
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
