import Dashboard from "@/component/Dashboard"
import AuthGuard from "@/component/AuthGuard"

export default function DashboardPage() {
    return (
        <AuthGuard>
            <Dashboard />
        </AuthGuard>
    )
}
