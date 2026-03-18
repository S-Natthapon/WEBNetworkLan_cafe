'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addMenuItem, fetchCategories, getCurrentUser, type Category } from '@/service/api'

export default function AddMenu() {
  const router = useRouter()
  
  // Menu item state
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  
  const [categories, setCategories] = useState<Category[]>([])
  
  // Admin confirmation state
  const [showConfirm, setShowConfirm] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data)
      if (data.length > 0) setCategoryId(data[0].id)
    }).catch(err => {
      console.error('Failed to fetch categories:', err)
    })
  }, [])

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!name.trim() || !price || !categoryId) {
      setError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, ราคา, หมวดหมู่)')
      return
    }
    
    const user = getCurrentUser()
    if (user?.role === 'admin') {
      setAdminId(user.id)
    }
    
    setShowConfirm(true)
  }

  const handleAddMenu = async () => {
    if (!adminId.trim() || !adminPassword.trim()) {
      setError('กรุณากรอกข้อมูล Admin เพื่อยืนยัน')
      return
    }

    setLoading(true)
    setError('')
    try {
      await addMenuItem({
        name,
        name_en: nameEn,
        price: parseFloat(price),
        category_id: categoryId,
        description,
        adminId,
        adminPassword
      })
      
      setSuccess('เพิ่มเมนูเรียบร้อยแล้ว')
      setName('')
      setNameEn('')
      setPrice('')
      setDescription('')
      setAdminPassword('')
      setShowConfirm(false)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-[100dvh] bg-[#1A1612] font-sans text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cafe-gradient" />
        <div className="bg-cafe-pattern" />
      </div>

      <div className="relative z-10 min-h-dvh flex items-center justify-center p-4 py-12">
        <div className="animate-scale-in w-full max-w-[500px] flex flex-col gap-6">
          
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent">เพิ่มเมนูใหม่</span>
            </h1>
            <p className="text-muted text-sm mt-1.5">เพิ่มรายการอาหารหรือเครื่องดื่ม Pot Cafe</p>
          </div>

          <div className="bg-surface-raised/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
            <form className="flex flex-col gap-4" onSubmit={handleOpenConfirm}>
              
              {error && (
                <div className="animate-fade-in p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="animate-fade-in p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ชื่อเมนู (ไทย)</label>
                  <input
                    type="text"
                    className="w-full py-3 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น เอสเพรสโซ่"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ชื่อเมนู (Eng)</label>
                  <input
                    type="text"
                    className="w-full py-3 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Espresso"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ราคา (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full py-3 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="65"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">หมวดหมู่</label>
                  <select 
                    className="w-full py-3 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">คำอธิบาย</label>
                <textarea
                  className="w-full py-3 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดเมนู..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-xl text-base font-semibold bg-linear-to-r from-primary to-primary-dark text-surface shadow-lg"
              >
                เพิ่มเมนู
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 text-sm text-muted hover:text-white transition-colors"
              >
                ย้อนกลับ
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Admin Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#1e1915] border border-border rounded-3xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-xl font-bold">Admin ยืนยัน</h3>
              <p className="text-gray-500 text-sm mt-1">กรุณากรอกรหัสผ่าน Admin เพื่อยืนยันการเพิ่มเมนู</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">รหัส Admin</label>
                <input
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">รหัสผ่าน Admin</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                  placeholder="รหัสผ่าน"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-3 rounded-xl border border-border text-gray-300 hover:bg-white/5 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddMenu}
                disabled={loading}
                className="py-3 rounded-xl bg-primary text-[#1A1612] font-bold hover:bg-primary-light transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'กำลังโหลด...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
