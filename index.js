if (typeof window === 'undefined') {
  throw new Error('This module only works in the browser.')
}

const { fetch: originalFetch } = window;
const fetch = async (...args) => {
  let [resource, config = {}] = args;
  if ((config.method && config.method !== 'GET') || (!config.ttl)) {
    console.log('fetching no cache');
    return await originalFetch(resource, config);
  }
  let ttl = config.ttl ? config.ttl * 1000 : 0
  let cache = localStorage.getItem(resource) ? JSON.parse(localStorage.getItem(resource)) : null;
  if (!cache) {
    const res = await originalFetch(resource, config);
    cache = {
      data: await res.json(),
      timestamp: Date.now(),
      ttl
    }
  }
  const { data, timestamp, ttl: originalTtl } = cache
  if (Date.now() > timestamp + cache.ttl) {
    localStorage.removeItem(resource)
  } else {
    if (ttl != originalTtl) {
      cache.ttl = ttl
    }
    localStorage.setItem(resource, JSON.stringify(cache))
  }
  return new Response(JSON.stringify(data))
};

export default fetch;
