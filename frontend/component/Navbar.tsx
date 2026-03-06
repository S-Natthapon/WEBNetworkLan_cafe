
function Navbar() {

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface-raised/80 backdrop-blur-sm shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md shadow-black/30">
          <span className="text-lg">☕</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-primary leading-none">Pot Cafe</h1>
          <p className="text-xs text-muted mt-0.5">ขอบคุณที่ใช้บริการ</p>
        </div>
      </div>

      {/* Center: Quick stats */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-muted">ตำแหน่งโต้ะ</p>
          <p className="text-sm font-semibold text-foreground">
            5
          </p>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="text-center">
          <p className="text-xs text-muted">บิลที่</p>
          <p className="text-sm font-semibold text-primary">
            3
          </p>
        </div>
      </div>

      
    </nav>
  );
}

export default Navbar;
