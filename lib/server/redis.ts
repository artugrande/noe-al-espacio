import { Redis } from "@upstash/redis"

let client: Redis | null | undefined

export function isRedisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

export function getRedis() {
  if (client !== undefined) return client
  if (!isRedisConfigured()) {
    client = null
    return client
  }
  client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return client
}
