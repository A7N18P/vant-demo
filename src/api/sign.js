import CryptoJS from 'crypto-js'
import qs from 'qs'

/**
 * 不参与加签过程的 header key
 */
const HEADER_KEYS_TO_IGNORE = new Set([
  'authorization',
  'content-type',
  'content-length',
  'user-agent',
  'presigned-expires',
  'expect',
])

export function sign(params) {
  const {
    headers = {},
    query = {},
    region = '',
    serviceName = '',
    method = '',
    pathName = '/',
    accessKeyId = '',
    secretAccessKey = '',
    needSignHeaderKeys = [],
    bodySha,
  } = params

  const datetime = headers['X-Date']
  const date = datetime.substring(0, 8)

  const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, needSignHeaderKeys)
  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || '',
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha || hash(''),
  ].join('\n')

  const credentialScope = [date, region, serviceName, 'request'].join('/')
  const stringToSign = ['HMAC-SHA256', datetime, credentialScope, hash(canonicalRequest)].join('\n')

  const kDate = hmac(`TC3${secretAccessKey}`, date)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, serviceName)
  const kSigning = hmac(kService, 'request')
  const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex)

  return [
    'HMAC-SHA256',
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`,
  ].join(' ')
}

function hmac(key, data) {
  return CryptoJS.HmacSHA256(data, key)
}

function hash(content) {
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex)
}

export function queryParamsToString(params) {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const val = params[key]
      if (typeof val === 'undefined' || val === null) {
        return undefined
      }
      const escapedKey = uriEscape(key)
      if (!escapedKey) {
        return undefined
      }
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`
      }
      return `${escapedKey}=${uriEscape(val)}`
    })
    .filter((v) => v)
    .join('&')
}

export function getSignHeaders(originHeaders, needSignHeaders) {
  function trimHeaderValue(header) {
    return header?.toString?.().trim().replace(/\s+/g, ' ') ?? ''
  }

  let h = Object.keys(originHeaders)
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()))
    h = h.filter((k) => needSignSet.has(k.toLowerCase()))
  }

  h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()))

  const signedHeaderKeys = h
    .slice()
    .map((k) => k.toLowerCase())
    .sort()
    .join(';')

  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join('\n')

  return [signedHeaderKeys, canonicalHeaders]
}

function uriEscape(str) {
  try {
    return encodeURIComponent(String(str))
      .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
      .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`)
  } catch {
    return ''
  }
}

export function getDateTimeNow() {
  const now = new Date()
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

export function getBodySha(body) {
  if (typeof body === 'string') {
    return hash(body)
  }

  if (body instanceof URLSearchParams) {
    return hash(body.toString())
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    const words = CryptoJS.lib.WordArray.create(body)
    return CryptoJS.SHA256(words).toString(CryptoJS.enc.Hex)
  }

  return hash('')
}

export async function doRequest() {
  const body = {
    image_url: 'https://pics6.baidu.com/feed/d009b3de9c82d158dfc49cbb83b1bbd7bd3e4244.jpeg',
  }
  const bodySha = getBodySha(qs.stringify(body))

  const targetHost = 'visual.volcengineapi.com'
  const requestHeaders = {
    ['X-Date']: getDateTimeNow(),
    ['Content-Type']: 'application/x-www-form-urlencoded',
  }
  const signParams = {
    headers: {
      ...requestHeaders,
      Host: targetHost,
    },
    method: 'POST',
    query: {
      Version: '2020-08-26',
      Action: 'GeneralSegment',
    },
    accessKeyId: import.meta.env.VITE_AI_AK,
    secretAccessKey: import.meta.env.VITE_AI_SK,
    serviceName: 'cv',
    region: 'cn-north-1',
    bodySha,
    needSignHeaderKeys: ['x-date', 'host', 'content-type'],
  }

  for (const [key, val] of Object.entries(signParams.query)) {
    if (val === undefined || val === null) {
      signParams.query[key] = ''
    }
  }

  const authorization = sign(signParams)
  const res = await fetch(`/visual/?${qs.stringify(signParams.query)}`, {
    headers: {
      ...requestHeaders,
      Authorization: authorization,
    },
    method: signParams.method,
    body: qs.stringify(body),
  })
  // console.warn(await res.json())
  return res.text()
}
