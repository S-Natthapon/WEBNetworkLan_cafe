'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveSession, getCurrentUser, checkHealth, login, type User } from '@/service/api'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverOk, setServerOk] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  /* ── ถ้า login แล้ว → redirect ── */
  useEffect(() => {
    const u = getCurrentUser()
    if (u) router.replace('/dashboard')
  }, [router])

  /* ── เช็คสถานะเซิร์ฟเวอร์ ── */
  useEffect(() => {
    checkHealth().then(setServerOk)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const id = staffId.trim()
    const p = password.trim()

    if (!id) { setError('กรุณากรอกรหัสพนักงาน'); return }
    if (!p) { setError('กรุณากรอกรหัสผ่าน'); return }

    setLoading(true)
    try {
      const { token, user } = await login(id, p)
      saveSession(token, user)
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-[100dvh] bg-[#1A1612] font-sans text-white">

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cafe-gradient" />
        <div className="bg-cafe-pattern" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 min-h-dvh flex items-center justify-center p-4">
        <div className="animate-scale-in w-full max-w-[420px] flex flex-col gap-6">

          {/* Logo Card */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-5 bg-linear-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(196,167,125,0.25)] transition-transform hover:scale-105">
              <span className="text-4xl drop-shadow-lg">☕</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent">Pot Cafe</span>
            </h1>
            <p className="text-muted text-sm mt-1.5">ระบบจัดการร้านกาแฟ</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-raised/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-black/40">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

              {/* Server status */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${serverOk === true ? 'bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : serverOk === false ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]' : 'bg-gray-500 animate-pulse'}`} />
                <span className={serverOk === true ? 'text-emerald-400/80' : serverOk === false ? 'text-red-400/80' : 'text-muted'}>
                  {serverOk === true ? 'เซิร์ฟเวอร์พร้อมใช้งาน' : serverOk === false ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์' : 'กำลังตรวจสอบ...'}
                </span>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-fade-in flex items-center gap-2.5 p-3.5 px-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Staff ID */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="staffId" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  username
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none transition-colors group-focus-within:text-primary">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="staffId"
                    className="w-full py-3.5 px-4 pl-12 text-[15px] text-foreground bg-surface border border-border rounded-xl outline-none transition-all placeholder:text-[#5a5249] focus:border-primary focus:shadow-[0_0_0_3px_rgba(196,167,125,0.15)] hover:border-[#5a5249]"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="เช่น admin, cashier"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  password
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none transition-colors group-focus-within:text-primary">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full py-3.5 px-4 pl-12 pr-12 text-[15px] text-foreground bg-surface border border-border rounded-xl outline-none transition-all placeholder:text-[#5a5249] focus:border-primary focus:shadow-[0_0_0_3px_rgba(196,167,125,0.15)] hover:border-[#5a5249]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-primary transition-colors rounded-lg"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !staffId.trim() || !password.trim()}
                className="w-full py-4 rounded-xl text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-linear-to-r from-primary to-primary-dark text-surface shadow-[0_4px_20px_rgba(196,167,125,0.2)] hover:shadow-[0_8px_30px_rgba(196,167,125,0.35)] hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
              <p className="text-xs text-[#5a5249]">เข้าระบบด้วยรหัสพนักงาน</p>
              <span className="text-[10px] text-border font-mono">v1.0</span>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-[#5a5249]">
            ไม่มีบัญชีผู้ใช้? <span className="text-muted"><Link href="/add-emp">เพิ่มพนักงาน</Link></span>
          </p>
        </div>
      </div>
    </main>
  )
}
