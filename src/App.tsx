import { useState } from 'react';
import { Download, Plus, Trash2, FileText, Upload, X, DollarSign, CheckCircle, Send, Edit, MoreVertical, Palette } from 'lucide-react';

interface Item {
  description: string;
  amount: string;
}

interface Activity {
  type: string;
  description: string;
  timestamp: string;
}

interface Payment {
  paymentDate: string;
  amountPaid: string;
  paymentMethod: string;
  notes: string;
  recordedAt: string;
}

interface Invoice {
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  invoiceDate: string;
  dueDate: string;
  items: Item[];
  notes: string;
  total: number;
  createdAt: string;
  payments: Payment[];
  activities: Activity[];
  sentDate?: string;
}

const colorOptions = {
  primary: [
    { name: 'Blue', value: 'blue', classes: 'bg-blue-600 hover:bg-blue-700 text-white', hexCode: '#2563eb' },
    { name: 'Brown', value: 'brown', classes: 'bg-amber-800 hover:bg-amber-900 text-white', hexCode: '#92400e' },
    { name: 'Gold', value: 'gold', classes: 'bg-yellow-600 hover:bg-yellow-700 text-white', hexCode: '#ca8a04' },
    { name: 'Black', value: 'black', classes: 'bg-gray-900 hover:bg-black text-white', hexCode: '#111827' },
    { name: 'Green', value: 'green', classes: 'bg-[#176636] hover:bg-[#0f4d26] text-white', hexCode: '#176636' }
  ],
  secondary: [
    { name: 'Light Blue', value: 'blue', classes: 'bg-blue-100 text-blue-700', hexCode: '#dbeafe' },
    { name: 'Light Brown', value: 'brown', classes: 'bg-amber-100 text-amber-800', hexCode: '#fef3c7' },
    { name: 'Light Gold', value: 'gold', classes: 'bg-yellow-100 text-yellow-700', hexCode: '#fef9c3' },
    { name: 'Light Gray', value: 'black', classes: 'bg-gray-100 text-gray-900', hexCode: '#f3f4f6' },
    { name: 'Light Green', value: 'green', classes: 'bg-[#EAF1C8] text-[#176636]', hexCode: '#EAF1C8' }
  ],
  accent: [
    { name: 'Blue', value: 'blue', classes: 'border-blue-500 text-blue-600', hexCode: '#3b82f6' },
    { name: 'Brown', value: 'brown', classes: 'border-amber-600 text-amber-800', hexCode: '#d97706' },
    { name: 'Gold', value: 'gold', classes: 'border-yellow-600 text-yellow-700', hexCode: '#ca8a04' },
    { name: 'Gray', value: 'black', classes: 'border-gray-900 text-gray-900', hexCode: '#111827' },
    { name: 'Green', value: 'green', classes: 'border-[#73B37F] text-[#176636]', hexCode: '#73B37F' }
  ],
  background: [
    { name: 'Blue', value: 'blue', classes: 'from-blue-50 to-indigo-100', hexCode: '#eff6ff' },
    { name: 'Brown', value: 'brown', classes: 'from-amber-50 to-orange-100', hexCode: '#fffbeb' },
    { name: 'Gold', value: 'gold', classes: 'from-yellow-50 to-amber-100', hexCode: '#fefce8' },
    { name: 'Gray', value: 'black', classes: 'from-gray-50 to-gray-200', hexCode: '#f9fafb' },
    { name: 'Green', value: 'green', classes: 'from-[#EAF1C8] to-[#73B37F]/20', hexCode: '#EAF1C8' }
  ]
};

export default function InvoiceApp() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'view'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMarkSentModal, setShowMarkSentModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom theme state
  const [customTheme, setCustomTheme] = useState({
    primary: 'blue',
    secondary: 'blue',
    accent: 'blue',
    background: 'blue'
  });

  // Company settings
  const [companyName, setCompanyName] = useState('Infusi Technologies Limited');
  const [companyLocation, setCompanyLocation] = useState('Ghana');
  const [tempCompanyName, setTempCompanyName] = useState('Infusi Technologies Limited');
  const [tempCompanyLocation, setTempCompanyLocation] = useState('Ghana');

  const getCurrentClasses = () => {
    return {
      primary: colorOptions.primary.find(c => c.value === customTheme.primary)?.classes || colorOptions.primary[0].classes,
      secondary: colorOptions.secondary.find(c => c.value === customTheme.secondary)?.classes || colorOptions.secondary[0].classes,
      accent: colorOptions.accent.find(c => c.value === customTheme.accent)?.classes || colorOptions.accent[0].classes,
      background: colorOptions.background.find(c => c.value === customTheme.background)?.classes || colorOptions.background[0].classes,
      primaryHex: colorOptions.primary.find(c => c.value === customTheme.primary)?.hexCode || '#2563eb'
    };
  };

  const theme = getCurrentClasses();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', amount: '' }],
    notes: ''
  });

  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    paymentMethod: '',
    notes: ''
  });

  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);

  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INF-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = (items = formData.items) => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);
  };

  const calculatePaidAmount = (invoice: Invoice) => {
    if (!invoice.payments) return 0;
    return invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid), 0);
  };

  const getInvoiceStatus = (invoice: Invoice) => {
    const total = invoice.total;
    const paid = calculatePaidAmount(invoice);
    const today = new Date();
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;

    if (paid === 0 && !invoice.sentDate) return 'draft';
    if (paid >= total) return 'paid';
    if (paid > 0 && paid < total) return 'partially-paid';
    if (dueDate && today > dueDate && paid < total) return 'overdue';
    if (invoice.sentDate) return 'sent';
    return 'draft';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'draft': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      'sent': { bg: theme.secondary, text: theme.accent.split(' ')[1], label: 'Sent' },
      'partially-paid': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partially Paid' },
      'paid': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      'overdue': { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    const primaryColor = theme.primaryHex;
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid ${primaryColor}; padding-bottom: 20px; }
          .logo { max-width: 150px; max-height: 80px; }
          .company-info { text-align: right; }
          .company-name { font-size: 24px; font-weight: bold; color: ${primaryColor}; margin: 0; }
          .invoice-title { font-size: 32px; font-weight: bold; color: ${primaryColor}; margin: 30px 0; }
          .invoice-details { margin-bottom: 30px; }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold; }
          .client-info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: ${primaryColor}; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .amount { text-align: right; }
          .total-section { text-align: right; margin-top: 30px; }
          .total-row { font-size: 20px; font-weight: bold; color: ${primaryColor}; margin-top: 10px; }
          .notes { margin-top: 40px; padding: 20px; background: #f9fafb; border-left: 4px solid ${primaryColor}; }
          .footer { margin-top: 60px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${logo ? `<img src="${logo}" class="logo" alt="Company Logo">` : ''}
          </div>
          <div class="company-info">
            <p class="company-name">${companyName}</p>
            <p style="margin: 5px 0;">${companyLocation}</p>
          </div>
        </div>
        
        <div class="invoice-title">INVOICE</div>
        
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
          <p><strong>Status:</strong> ${getInvoiceStatus(invoice).replace('-', ' ').toUpperCase()}</p>
        </div>
        
        <div class="client-info">
          <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">Bill To:</p>
          <p style="margin: 5px 0;"><strong>${invoice.clientName}</strong></p>
          ${invoice.clientAddress ? `<p style="margin: 5px 0;">${invoice.clientAddress}</p>` : ''}
          ${invoice.clientEmail ? `<p style="margin: 5px 0;">${invoice.clientEmail}</p>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 70%;">Description</th>
              <th style="width: 30%;" class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="amount">GH₵ ${parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div style="margin: 5px 0;">Subtotal: GH₵ ${invoice.total.toFixed(2)}</div>
          ${invoice.payments && invoice.payments.length > 0 ? `
            <div style="margin: 5px 0;">Amount Paid: GH₵ ${calculatePaidAmount(invoice).toFixed(2)}</div>
            <div class="total-row" style="color: #dc2626;">
              Balance Due: GH₵ ${(invoice.total - calculatePaidAmount(invoice)).toFixed(2)}
            </div>
          ` : `
            <div class="total-row">
              Total: GH₵ ${invoice.total.toFixed(2)}
            </div>
          `}
        </div>
        
        ${invoice.notes ? `
          <div class="notes">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Notes:</p>
            <p style="margin: 0;">${invoice.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>${companyName}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReceipt = (invoice: Invoice, payment: Payment) => {
    const primaryColor = theme.primaryHex;
    
    const receiptNumber = `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(invoice.payments.length).padStart(3, '0')}`;
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { background: ${primaryColor}; color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
          .receipt-title { font-size: 32px; font-weight: bold; margin: 0; }
          .company-info { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 20px; font-weight: bold; }
          .details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .payment-amount { background: #dbeafe; padding: 20px; text-align: center; font-size: 28px; font-weight: bold; color: ${primaryColor}; border-radius: 8px; margin: 30px 0; }
          .footer { text-align: center; margin-top: 60px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="receipt-title">RECEIPT</div>
        </div>
        
        <div class="company-info">
          ${logo ? `<img src="${logo}" style="max-width: 150px; max-height: 80px; margin-bottom: 15px;" alt="Logo">` : ''}
          <div class="company-name">${companyName}</div>
          <div>${companyLocation}</div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <strong>Receipt Number:</strong>
            <span>${receiptNumber}</span>
          </div>
          <div class="detail-row">
            <strong>Invoice Number:</strong>
            <span>${invoice.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <strong>Customer:</strong>
            <span>${invoice.clientName}</span>
          </div>
          <div class="detail-row">
            <strong>Invoice Total:</strong>
            <span>GH₵ ${invoice.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <strong>Payment Method:</strong>
            <span>${payment.paymentMethod}</span>
          </div>
          <div class="detail-row">
            <strong>Payment Date:</strong>
            <span>${new Date(payment.paymentDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <strong>Total Amount Paid:</strong>
            <span>GH₵ ${calculatePaidAmount(invoice).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <strong>Balance:</strong>
            <span>GH₵ ${(invoice.total - calculatePaidAmount(invoice)).toFixed(2)}</span>
          </div>
        </div>
        
        <div class="payment-amount">
          Amount Paid: GH₵ ${parseFloat(payment.amountPaid).toFixed(2)}
        </div>
        
        ${payment.notes ? `
          <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-left: 4px solid ${primaryColor};">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Payment Notes:</p>
            <p style="margin: 0;">${payment.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>${companyName}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveInvoice = () => {
    if (!formData.clientName || formData.items.some(item => !item.description || !item.amount)) {
      alert('Please fill in all required fields');
      return;
    }

    const newInvoice: Invoice = {
      ...formData,
      invoiceNumber: getNextInvoiceNumber(),
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
      payments: [],
      activities: [{
        type: 'created',
        description: 'Invoice created',
        timestamp: new Date().toISOString()
      }]
    };

    setInvoices([newInvoice, ...invoices]);
    
    setFormData({
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ description: '', amount: '' }],
      notes: ''
    });

    setCurrentView('list');
    alert('Invoice created successfully!');
  };

  const recordPayment = () => {
    if (!selectedInvoice) return;
    
    if (!paymentData.amountPaid || !paymentData.paymentMethod) {
      alert('Please fill in payment amount and method');
      return;
    }

    const payment: Payment = {
      ...paymentData,
      recordedAt: new Date().toISOString()
    };

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      payments: [...(selectedInvoice.payments || []), payment],
      activities: [
        {
          type: 'payment',
          description: `Payment of GH₵${parseFloat(paymentData.amountPaid).toFixed(2)} received via ${paymentData.paymentMethod}`,
          timestamp: new Date().toISOString()
        },
        ...(selectedInvoice.activities || [])
      ]
    };

    const updatedInvoices = invoices.map(inv => 
      inv.invoiceNumber === selectedInvoice.invoiceNumber ? updatedInvoice : inv
    );

    setInvoices(updatedInvoices);
    setSelectedInvoice(updatedInvoice);
    
    generateReceipt(updatedInvoice, payment);
    
    setShowPaymentModal(false);
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: '',
      paymentMethod: '',
      notes: ''
    });

    alert('Payment recorded and receipt generated!');
  };

  const markAsSent = () => {
    if (!selectedInvoice) return;
    
    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      sentDate: sentDate,
      activities: [
        {
          type: 'sent',
          description: 'Invoice sent to client',
          timestamp: new Date().toISOString()
        },
        ...(selectedInvoice.activities || [])
      ]
    };

    const updatedInvoices = invoices.map(inv => 
      inv.invoiceNumber === selectedInvoice.invoiceNumber ? updatedInvoice : inv
    );

    setInvoices(updatedInvoices);
    setSelectedInvoice(updatedInvoice);
    setShowMarkSentModal(false);
    setSentDate(new Date().toISOString().split('T')[0]);
  };

  const deleteInvoice = () => {
    if (!selectedInvoice) return;
    
    if (confirm('Are you sure you want to delete this invoice?')) {
      const updatedInvoices = invoices.filter(inv => inv.invoiceNumber !== selectedInvoice.invoiceNumber);
      setInvoices(updatedInvoices);
      setCurrentView('list');
      setSelectedInvoice(null);
    }
  };

  const editInvoice = () => {
    if (!selectedInvoice) return;
    
    setFormData({
      clientName: selectedInvoice.clientName,
      clientAddress: selectedInvoice.clientAddress,
      clientEmail: selectedInvoice.clientEmail,
      invoiceDate: selectedInvoice.invoiceDate,
      dueDate: selectedInvoice.dueDate,
      items: selectedInvoice.items,
      notes: selectedInvoice.notes
    });
    
    const updatedInvoices = invoices.filter(inv => inv.invoiceNumber !== selectedInvoice.invoiceNumber);
    setInvoices(updatedInvoices);
    
    setCurrentView('create');
    setSelectedInvoice(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-3 sm:p-4 md:p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme.accent.split(' ')[1]}`}>
                {companyName}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Invoice Management System</p>
            </div>
            <div className="flex gap-2">
              {/* Settings Button */}
              <button
                onClick={() => {
                  setTempCompanyName(companyName);
                  setTempCompanyLocation(companyLocation);
                  setShowSettings(true);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition text-sm sm:text-base"
                title="Company Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              {/* Theme Builder Button */}
              <button
                onClick={() => setShowThemeBuilder(!showThemeBuilder)}
                className={`${theme.primary} px-3 py-2 rounded-lg font-medium transition text-sm sm:text-base`}
                title="Customize Theme"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              {currentView !== 'create' && (
                <button
                  onClick={() => setCurrentView('create')}
                  className={`${theme.primary} px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base`}
                >
                  <Plus className="inline w-4 h-4 mr-2" />
                  New Invoice
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Company Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={tempCompanyLocation}
                    onChange={(e) => setTempCompanyLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="e.g., Ghana, Nigeria, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (tempCompanyName.trim()) {
                      setCompanyName(tempCompanyName);
                      setCompanyLocation(tempCompanyLocation);
                      setShowSettings(false);
                    } else {
                      alert('Company name is required');
                    }
                  }}
                  className={`flex-1 ${theme.primary} px-4 py-2 rounded-lg font-medium`}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Theme Builder Modal */}
        {showThemeBuilder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Theme Builder</h3>
                <button onClick={() => setShowThemeBuilder(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">Mix and match colors to create your perfect theme</p>

              {/* Primary Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Color (Buttons & Headers)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colorOptions.primary.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCustomTheme({ ...customTheme, primary: color.value })}
                      className={`${color.classes} px-4 py-3 rounded-lg font-medium transition relative ${
                        customTheme.primary === color.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                      }`}
                    >
                      {color.name}
                      {customTheme.primary === color.value && (
                        <CheckCircle className="absolute top-1 right-1 w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Secondary Color (Badges & Highlights)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colorOptions.secondary.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCustomTheme({ ...customTheme, secondary: color.value })}
                      className={`${color.classes} px-4 py-3 rounded-lg font-medium transition relative ${
                        customTheme.secondary === color.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                      }`}
                    >
                      {color.name}
                      {customTheme.secondary === color.value && (
                        <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Accent Color (Text & Borders)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colorOptions.accent.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCustomTheme({ ...customTheme, accent: color.value })}
                      className={`border-2 ${color.classes} px-4 py-3 rounded-lg font-medium transition relative ${
                        customTheme.accent === color.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                      }`}
                    >
                      {color.name}
                      {customTheme.accent === color.value && (
                        <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Background Gradient</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colorOptions.background.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCustomTheme({ ...customTheme, background: color.value })}
                      className={`bg-gradient-to-br ${color.classes} px-4 py-3 rounded-lg font-medium transition relative border-2 ${
                        customTheme.background === color.value ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' : 'border-gray-300'
                      }`}
                    >
                      {color.name}
                      {customTheme.background === color.value && (
                        <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
                <div className={`bg-gradient-to-br ${theme.background} p-4 rounded-lg`}>
                  <h3 className={`text-xl font-bold ${theme.accent.split(' ')[1]} mb-2`}>Sample Invoice Header</h3>
                  <button className={`${theme.primary} px-4 py-2 rounded-lg text-sm mr-2`}>
                    Primary Button
                  </button>
                  <span className={`${theme.secondary} px-3 py-1 rounded-full text-xs`}>
                    Secondary Badge
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCustomTheme({ primary: 'blue', secondary: 'blue', accent: 'blue', background: 'blue' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => setShowThemeBuilder(false)}
                  className={`flex-1 ${theme.primary} px-4 py-2 rounded-lg font-medium`}
                >
                  Apply Theme
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice List View */}
        {currentView === 'list' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Invoices</h2>
            
            {invoices.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FileText className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg mb-2">No invoices created yet</p>
                <button
                  onClick={() => setCurrentView('create')}
                  className={`mt-4 ${theme.primary} px-4 sm:px-6 py-2 rounded-lg font-medium transition text-sm sm:text-base`}
                >
                  Create Your First Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {invoices.map((invoice, index) => {
                  const status = getInvoiceStatus(invoice);
                  const paidAmount = calculatePaidAmount(invoice);
                  const balance = invoice.total - paidAmount;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition cursor-pointer"
                         onClick={() => {
                           setSelectedInvoice(invoice);
                           setCurrentView('view');
                         }}>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`font-bold text-base sm:text-lg ${theme.accent.split(' ')[1]}`}>
                                {invoice.invoiceNumber}
                              </h3>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-sm sm:text-base text-gray-600">{invoice.clientName}</p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">GH₵ {invoice.total.toFixed(2)}</p>
                            {paidAmount > 0 && (
                              <p className="text-xs sm:text-sm text-green-600">Paid: GH₵ {paidAmount.toFixed(2)}</p>
                            )}
                            {balance > 0 && paidAmount > 0 && (
                              <p className="text-xs sm:text-sm text-red-600">Balance: GH₵ {balance.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Invoice View */}
        {currentView === 'create' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Invoice</h2>
              <button
                onClick={() => setCurrentView('list')}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Logo Upload */}
            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo (Optional)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {logo && (
                  <img src={logo} alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain border rounded" />
                )}
                <label className="w-full sm:w-auto cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition text-center text-sm sm:text-base">
                  <Upload className="inline w-4 h-4 mr-2" />
                  {logo ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Client Information */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                    placeholder="client@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Address
                  </label>
                  <input
                    type="text"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter client address"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Items/Expenses</h3>
                <button
                  onClick={addItem}
                  className={`${theme.primary} px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base`}
                >
                  <Plus className="inline w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Cost of registering P.O. Box"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateItem(index, 'amount', e.target.value)}
                      className="flex-1 sm:w-32 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                      placeholder="Amount"
                      step="0.01"
                    />
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-right">
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                  Total: GH₵ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base"
                rows={3}
                placeholder="Add any additional notes or payment terms"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={saveInvoice}
              className={`w-full ${theme.primary} font-bold py-3 rounded-lg transition text-sm sm:text-base`}
            >
              <CheckCircle className="inline w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Create Invoice
            </button>
          </div>
        )}

        {/* View Invoice */}
        {currentView === 'view' && selectedInvoice && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <button
                  onClick={() => {
                    setCurrentView('list');
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showActionsMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          editInvoice();
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowMarkSentModal(true);
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Mark as Sent
                      </button>
                      <button
                        onClick={() => {
                          generateInvoicePDF(selectedInvoice);
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </button>
                      <button
                        onClick={() => {
                          deleteInvoice();
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                {getStatusBadge(getInvoiceStatus(selectedInvoice))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {selectedInvoice.invoiceNumber}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date of Issue</p>
                  <p className="font-semibold">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                </div>
                {selectedInvoice.dueDate && (
                  <div>
                    <p className="text-gray-600">Date Due</p>
                    <p className="font-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Bill To</h3>
                <p className="font-semibold">{selectedInvoice.clientName}</p>
                {selectedInvoice.clientAddress && <p className="text-sm text-gray-600">{selectedInvoice.clientAddress}</p>}
                {selectedInvoice.clientEmail && <p className="text-sm text-gray-600">{selectedInvoice.clientEmail}</p>}
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2">Item</th>
                      <th className="text-right py-3 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2">{item.description}</td>
                        <td className="text-right py-3 px-2">GH₵ {parseFloat(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-end space-y-2">
                <div className="flex justify-between w-full sm:w-64">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">GH₵ {selectedInvoice.total.toFixed(2)}</span>
                </div>
                {calculatePaidAmount(selectedInvoice) > 0 && (
                  <>
                    <div className="flex justify-between w-full sm:w-64">
                      <span className="text-green-600">Amount Paid:</span>
                      <span className="font-semibold text-green-600">GH₵ {calculatePaidAmount(selectedInvoice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full sm:w-64 text-lg">
                      <span className="font-bold text-red-600">Balance Due:</span>
                      <span className="font-bold text-red-600">GH₵ {(selectedInvoice.total - calculatePaidAmount(selectedInvoice)).toFixed(2)}</span>
                    </div>
                  </>
                )}
                {calculatePaidAmount(selectedInvoice) === 0 && (
                  <div className="flex justify-between w-full sm:w-64 text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">GH₵ {selectedInvoice.total.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {selectedInvoice.notes && (
                <div className={`mt-6 p-4 ${theme.secondary} rounded-lg ${theme.accent}`}>
                  <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => generateInvoicePDF(selectedInvoice)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition"
                >
                  <Download className="inline w-4 h-4 mr-2" />
                  Download Invoice
                </button>
                {calculatePaidAmount(selectedInvoice) < selectedInvoice.total && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition"
                  >
                    <DollarSign className="inline w-4 h-4 mr-2" />
                    Record Payment
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activities</h3>
              <p className="text-sm text-gray-500 mb-4">View all actions & payments made on this invoice.</p>
              
              <div className="space-y-3">
                {selectedInvoice.activities && selectedInvoice.activities.map((activity, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg h-fit ${
                      activity.type === 'payment' ? 'bg-green-100' : 
                      activity.type === 'sent' ? theme.secondary : 'bg-gray-100'
                    }`}>
                      {activity.type === 'payment' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                       activity.type === 'sent' ? <Send className={`w-4 h-4 ${theme.accent.split(' ')[1]}`} /> :
                       <FileText className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg mb-4 flex justify-between text-sm">
                <div>
                  <p className="text-gray-600">Amount Invoiced</p>
                  <p className="font-bold">GH₵ {selectedInvoice.total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Outstanding Amount</p>
                  <p className="font-bold">GH₵ {(selectedInvoice.total - calculatePaidAmount(selectedInvoice)).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid *</label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  >
                    <option value="">Select payment method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
                    rows={3}
                    placeholder="Add payment notes (optional)"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={recordPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Sent Modal */}
        {showMarkSentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Mark As Sent</h3>
                <button onClick={() => setShowMarkSentModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Sent *</label>
                  <input
                    type="date"
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowMarkSentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={markAsSent}
                  className={`flex-1 ${theme.primary} px-4 py-2 rounded-lg font-medium`}
                >
                  Mark As Sent
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}