

const SECRET = process.env.TABLE_SECRET || 'QR-cafe-2026-secret'

/** Simple hash function (djb2 + hex) */
function simpleHash(str: string): string {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(hash).toString(16).padStart(6, '0').slice(0, 6)
}

/** สร้าง slug จากเลขโต๊ะ เช่น "5" → "5-a3f2c1" */
export function encodePosition(id: string): string {
    const hash = simpleHash(id + SECRET)
    return `${id}-${hash}`
}

/** ถอดรหัส slug → เลขโต๊ะ (หรือ null ถ้า hash ไม่ถูก) */
export function decodePosition(slug: string): string | null {
    const dashIdx = slug.lastIndexOf('-')
    if (dashIdx === -1) return null

    const id = slug.slice(0, dashIdx)
    const hash = slug.slice(dashIdx + 1)

    if (!id || !hash) return null

    const expected = simpleHash(id + SECRET)
    return hash === expected ? id : null
}

/** สร้าง URL เต็มสำหรับ QR code */
export function getPositionUrl(id: string, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}/position/${encodePosition(id)}`
}

/** จำนวนโต๊ะทั้งหมด (จาก .env) */
export function getTableCount(): number {
    return Number(process.env.TABLE_COUNT) || 10
}

/** สร้าง URL ทั้งหมดสำหรับโต๊ะ 1-N (default = TABLE_COUNT) */
export function generatePositionUrls(count?: number, baseUrl?: string): { id: string; slug: string; url: string }[] {
    const n = count ?? getTableCount()
    return Array.from({ length: n }, (_, i) => {
        const id = String(i + 1)
        const slug = encodePosition(id)
        return { id, slug, url: getPositionUrl(id, baseUrl) }
    })
}
