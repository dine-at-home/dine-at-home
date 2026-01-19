'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { payoutService, PaymentDetail } from '@/lib/payout-service'
import {
  Receipt,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Filter,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PaymentDetailsSectionProps {
  hostId: string
}

export function PaymentDetailsSection({ hostId }: PaymentDetailsSectionProps) {
  const [payments, setPayments] = useState<PaymentDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    bookingStatus: 'all',
  })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    loadPayments()
  }, [hostId, filters, page])

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await payoutService.getHostPaymentDetails(hostId, {
        status: filters.status !== 'all' ? filters.status : undefined,
        bookingStatus: filters.bookingStatus !== 'all' ? filters.bookingStatus : undefined,
        page,
        limit,
      })

      if (result.success) {
        setPayments(result.data || [])
        setTotal(result.pagination?.total || 0)
      }
    } catch (err: any) {
      console.error('Error loading payment details:', err)
      setError(err.message || 'Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="default" className="bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case 'REFUNDED':
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            Refunded
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getWithdrawalStatus = (payment: PaymentDetail) => {
    if (payment.isPaidOut) {
      return (
        <Badge variant="default" className="bg-blue-600">
          Paid Out
        </Badge>
      )
    }

    if (payment.readyToWithdrawAt) {
      const readyAt = new Date(payment.readyToWithdrawAt)
      const now = new Date()
      if (readyAt <= now) {
        return (
          <Badge variant="default" className="bg-green-600">
            Ready
          </Badge>
        )
      } else {
        const hoursRemaining = Math.ceil((readyAt.getTime() - now.getTime()) / (1000 * 60 * 60))
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            {hoursRemaining}h left
          </Badge>
        )
      }
    }

    if (payment.bookingStatus === 'COMPLETED') {
      return (
        <Badge variant="outline" className="border-yellow-300 text-yellow-700">
          Processing
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="border-gray-300 text-gray-700">
        Waiting
      </Badge>
    )
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          View all payments from your bookings, including amounts, fees, and withdrawal status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Payment Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Booking Status</label>
            <Select
              value={filters.bookingStatus}
              onValueChange={(value) => setFilters({ ...filters, bookingStatus: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Payments Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dinner</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Your Earnings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Withdrawal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.dinnerTitle}</p>
                          <p className="text-xs text-muted-foreground">Booking: {payment.bookingId.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            {payment.guest.image ? (
                              <AvatarImage src={payment.guest.image} alt={payment.guest.name} />
                            ) : null}
                            <AvatarFallback>{(payment.guest.name || 'G')[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{payment.guest.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(payment.dinnerDate)}</p>
                          <p className="text-xs text-muted-foreground">{payment.dinnerTime}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total payment</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(payment.platformFee, payment.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(payment.platformFee / payment.amount * 100).toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(payment.hostAmount, payment.currency)}
                        </div>
                        {payment.refundedAmount > 0 && (
                          <div className="text-xs text-orange-600">
                            Refunded: {formatCurrency(payment.refundedAmount, payment.currency)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.paymentStatus)}</TableCell>
                      <TableCell>{getWithdrawalStatus(payment)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} payments
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
