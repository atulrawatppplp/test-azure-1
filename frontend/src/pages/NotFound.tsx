import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/States'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <EmptyState
      title="Page not found"
      description="The page you were looking for does not exist."
      action={<Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>}
    />
  )
}
