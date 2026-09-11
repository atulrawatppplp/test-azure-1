import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Form, FormActions, FormRow } from '../components/ui/Form'
import { Input } from '../components/ui/Input'
import { config } from '../lib/config'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { resetDb } from '../services/mock/mockDb'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [company, setCompany] = useState(user?.company ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (name.trim().length < 3) {
      toast.error('Name must be at least 3 characters')
      return
    }
    setIsSaving(true)
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), company: company.trim() })
      toast.success('Profile updated')
    } catch (cause) {
      toast.error('Update failed', cause instanceof Error ? cause.message : undefined)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Profile" description="Account details and workspace settings." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Account details">
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} />
              <Input label="Email" value={user?.email ?? ''} disabled hint="Managed by Entra ID." />
            </FormRow>
            <FormRow>
              <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Input label="Company" value={company} onChange={(event) => setCompany(event.target.value)} />
            </FormRow>
            <FormActions>
              <Button type="submit" isLoading={isSaving}>
                Save changes
              </Button>
            </FormActions>
          </Form>
        </Card>

        <div className="space-y-4">
          <Card title="Session">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Role</dt>
                <dd>
                  <Badge tone="info">{user?.role}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">API mode</dt>
                <dd>
                  <Badge tone={config.useMockApi ? 'warning' : 'success'}>
                    {config.useMockApi ? 'Mock services' : 'Live .NET APIs'}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Gateway</dt>
                <dd className="truncate text-xs text-slate-600">{config.apiBaseUrl}</dd>
              </div>
            </dl>
            <Button
              className="mt-4"
              fullWidth
              variant="outline"
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
            >
              Sign out
            </Button>
          </Card>

          <Card title="Demo data">
            <p className="text-sm text-slate-600">Restore the seeded products, orders and notifications.</p>
            <Button
              className="mt-3"
              fullWidth
              variant="danger"
              onClick={() => {
                resetDb()
                toast.success('Mock data reset')
              }}
            >
              Reset mock data
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}
