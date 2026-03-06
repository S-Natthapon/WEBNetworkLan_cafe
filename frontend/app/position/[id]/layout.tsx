
//Components
import Navbar from "@/component/Navbar"
export default function PositionLayout({
  children
}: {
  children: React.ReactNode
}) {


  return (
    <div>
      <nav>
        <Navbar />
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}