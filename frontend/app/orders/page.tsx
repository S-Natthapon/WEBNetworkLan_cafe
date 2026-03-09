import OrderBoard from '@/component/OrderBoard'
import AuthGuard from '@/component/AuthGuard'

export default function OrdersPage() {
    return (
        <AuthGuard>
            <OrderBoard />
        </AuthGuard>
    )
}
