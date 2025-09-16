import React, { useState, useEffect } from 'react';
import { Download, Eye, RefreshCw, Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { toast } from '@/lib/toast';
import { SubscriptionBilling } from '@/api/subscriptionService';

interface BillingHistoryProps {
  limit?: number;
  showHeader?: boolean;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  limit = 10,
  showHeader = true
}) => {
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [billingHistory, setBillingHistory] = useState<SubscriptionBilling[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SubscriptionBilling | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBillingHistory();
  }, [limit]);

  const loadBillingHistory = async () => {
    setIsLoading(true);
    try {
      const history = await subscriptionApi.getBillingHistory(limit);
      if (history && Array.isArray(history)) {
        setBillingHistory(history);
      } else {
        setBillingHistory([]);
      }
    } catch (error) {
      console.error('Failed to load billing history:', error);
      toast.error('Failed to load billing history');
      setBillingHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (transaction: SubscriptionBilling) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleDownloadInvoice = async (transaction: SubscriptionBilling) => {
    try {
      // This would typically call an API to generate and download the invoice
      toast.info('Invoice download feature coming soon');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading billing history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        {showHeader && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing History
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadBillingHistory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
        )}
        <CardContent>
          {!billingHistory || !Array.isArray(billingHistory) || billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No billing history</h3>
              <p className="text-muted-foreground">
                You haven't made any payments yet. Your billing history will appear here once you subscribe to a plan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory && Array.isArray(billingHistory) && billingHistory.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(transaction.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transaction.billing_metadata?.plan_name || 'Subscription Payment'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.billing_metadata?.billing_cycle || 'Monthly billing'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.payment_status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(transaction.payment_status)}
                              {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.payment_status === 'succeeded' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(transaction)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {billingHistory && Array.isArray(billingHistory) && billingHistory.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          {transaction.billing_metadata?.plan_name || 'Subscription Payment'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(transaction.payment_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.payment_status)}
                          {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {transaction.payment_status === 'succeeded' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(transaction)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Transaction Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{formatDate(selectedTransaction.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="font-semibold">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(selectedTransaction.payment_status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedTransaction.payment_status)}
                      {selectedTransaction.payment_status.charAt(0).toUpperCase() + selectedTransaction.payment_status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </div>

              {selectedTransaction.stripe_invoice_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stripe Invoice ID</label>
                  <p className="font-mono text-sm">{selectedTransaction.stripe_invoice_id}</p>
                </div>
              )}

              {selectedTransaction.stripe_payment_intent_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Intent ID</label>
                  <p className="font-mono text-sm">{selectedTransaction.stripe_payment_intent_id}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Billing Period</label>
                <p>
                  {formatDate(selectedTransaction.billing_period_start)} - {formatDate(selectedTransaction.billing_period_end)}
                </p>
              </div>

              {selectedTransaction.paid_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid At</label>
                  <p>{formatDate(selectedTransaction.paid_at)}</p>
                </div>
              )}

              {selectedTransaction.billing_metadata && Object.keys(selectedTransaction.billing_metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Details</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedTransaction.billing_metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                {selectedTransaction.payment_status === 'succeeded' && (
                  <Button onClick={() => handleDownloadInvoice(selectedTransaction)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
