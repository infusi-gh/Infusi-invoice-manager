import { useState, useEffect } from 'react';
import { Download, Plus, Trash2, FileText, Upload, X, DollarSign, Send, Edit, MoreVertical, Palette, Save } from 'lucide-react';

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// UPDATED: Added discount field
interface Item {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;  // NEW FIELD
  amount: number;
}

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'sent' | 'payment' | 'viewed';
  description: string;
  timestamp: string;
  metadata?: any;
}

interface Payment {
  id: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  notes: string;
  recordedAt: string;
  recordedBy?: string;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone?: string;
  invoiceDate: string;
  dueDate: string;
  items: Item[];
  notes: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
  payments: Payment[];
  activities: Activity[];
  sentDate?: string;
  terms?: string;
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
  // Load data from localStorage on mount
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('invoices', []));
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'view'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [logo, setLogo] = useState<string | null>(() => loadFromStorage('logo', null));
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMarkSentModal, setShowMarkSentModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom theme state
  const [customTheme, setCustomTheme] = useState(() => loadFromStorage('theme', {
    primary: 'blue',
    secondary: 'blue',
    accent: 'blue',
    background: 'blue'
  }));

  // Company settings
  const [companyName, setCompanyName] = useState(() => loadFromStorage('companyName', 'Infusi Technologies Limited'));
  const [companyAddress, setCompanyAddress] = useState(() => loadFromStorage('companyAddress', 'Kumasi, Ghana'));
  const [companyEmail, setCompanyEmail] = useState(() => loadFromStorage('companyEmail', 'info@infusitech.com'));
  const [companyPhone, setCompanyPhone] = useState(() => loadFromStorage('companyPhone', '+233 XX XXX XXXX'));
  const [companyWebsite, setCompanyWebsite] = useState(() => loadFromStorage('companyWebsite', 'www.infusitech.com'));
  
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  const [tempCompanyAddress, setTempCompanyAddress] = useState(companyAddress);
  const [tempCompanyEmail, setTempCompanyEmail] = useState(companyEmail);
  const [tempCompanyPhone, setTempCompanyPhone] = useState(companyPhone);
  const [tempCompanyWebsite, setTempCompanyWebsite] = useState(companyWebsite);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save invoices');
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(customTheme));
    } catch (e) {
      console.error('Failed to save theme');
    }
  }, [customTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('logo', JSON.stringify(logo));
    } catch (e) {
      console.error('Failed to save logo');
    }
  }, [logo]);

  useEffect(() => {
    try {
      localStorage.setItem('companyName', JSON.stringify(companyName));
      localStorage.setItem('companyAddress', JSON.stringify(companyAddress));
      localStorage.setItem('companyEmail', JSON.stringify(companyEmail));
      localStorage.setItem('companyPhone', JSON.stringify(companyPhone));
      localStorage.setItem('companyWebsite', JSON.stringify(companyWebsite));
    } catch (e) {
      console.error('Failed to save company info');
    }
  }, [companyName, companyAddress, companyEmail, companyPhone, companyWebsite]);

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
    clientPhone: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    // UPDATED: Added discount: 0 to initial item
    items: [{ id: generateUUID(), description: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }] as Item[],
    notes: '',
    terms: 'Payment is due within 30 days',
    taxRate: 0
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

  // UPDATED: Calculate amount with discount
  const calculateItemAmount = (quantity: number, unitPrice: number, discount: number): number => {
    const baseAmount = quantity * unitPrice;
    return baseAmount - discount;
  };

  const calculateSubtotal = (): number => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = (subtotal: number, taxRate: number): number => {
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal, formData.taxRate);
    return subtotal + tax;
  };

  // UPDATED: Add discount: 0 to new items
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: generateUUID(), description: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }]
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  // UPDATED: Handle discount in calculation
  const updateItem = (id: string, field: keyof Item, value: any) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate amount when quantity, unitPrice, or discount changes
          if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            updatedItem.amount = calculateItemAmount(
              field === 'quantity' ? value : updatedItem.quantity,
              field === 'unitPrice' ? value : updatedItem.unitPrice,
              field === 'discount' ? value : updatedItem.discount
            );
          }
          return updatedItem;
        }
        return item;
      })
    });
  };

  const determineInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
    const totalPaid = calculatePaidAmount(invoice);
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);

    if (totalPaid >= invoice.total) return 'paid';
    if (totalPaid > 0) return 'partial';
    if (!invoice.sentDate) return 'draft';
    if (dueDate < today) return 'overdue';
    return 'sent';
  };

  const createInvoice = () => {
    if (!formData.clientName || formData.items.length === 0) {
      alert('Please fill in client name and add at least one item');
      return;
    }

    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax(subtotal, formData.taxRate);
    const total = calculateTotal();

    const newInvoice: Invoice = {
      id: generateUUID(),
      invoiceNumber: getNextInvoiceNumber(),
      clientName: formData.clientName,
      clientAddress: formData.clientAddress,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      items: formData.items,
      notes: formData.notes,
      terms: formData.terms,
      subtotal,
      taxRate: formData.taxRate,
      taxAmount,
      total,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payments: [],
      activities: [{
        id: generateUUID(),
        type: 'created',
        description: 'Invoice created',
        timestamp: new Date().toISOString()
      }]
    };

    setInvoices([...invoices, newInvoice]);
    // UPDATED: Reset form with discount: 0
    setFormData({
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      clientPhone: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ id: generateUUID(), description: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }],
      notes: '',
      terms: 'Payment is due within 30 days',
      taxRate: 0
    });
    setCurrentView('list');
  };

  const calculatePaidAmount = (invoice: Invoice): number => {
    return invoice.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  };

  const recordPayment = () => {
    if (!selectedInvoice || !paymentData.amountPaid || !paymentData.paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    const amountPaid = parseFloat(paymentData.amountPaid);
    const currentPaid = calculatePaidAmount(selectedInvoice);
    const remainingBalance = selectedInvoice.total - currentPaid;

    if (amountPaid > remainingBalance) {
      alert(`Payment amount exceeds balance due (GH₵ ${remainingBalance.toFixed(2)})`);
      return;
    }

    const newPayment: Payment = {
      id: generateUUID(),
      paymentDate: paymentData.paymentDate,
      amountPaid,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
      recordedAt: new Date().toISOString()
    };

    const updatedInvoice = {
      ...selectedInvoice,
      payments: [...selectedInvoice.payments, newPayment],
      activities: [
        ...selectedInvoice.activities,
        {
          id: generateUUID(),
          type: 'payment' as const,
          description: `Payment of GH₵ ${amountPaid.toFixed(2)} recorded`,
          timestamp: new Date().toISOString(),
          metadata: { amount: amountPaid, method: paymentData.paymentMethod }
        }
      ],
      updatedAt: new Date().toISOString()
    };

    updatedInvoice.status = determineInvoiceStatus(updatedInvoice);

    setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
    setSelectedInvoice(updatedInvoice);
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: '',
      paymentMethod: '',
      notes: ''
    });
    setShowPaymentModal(false);
  };

  const markAsSent = () => {
    if (!selectedInvoice) return;

    const updatedInvoice = {
      ...selectedInvoice,
      sentDate: sentDate,
      activities: [
        ...selectedInvoice.activities,
        {
          id: generateUUID(),
          type: 'sent' as const,
          description: `Invoice sent to ${selectedInvoice.clientEmail || selectedInvoice.clientName}`,
          timestamp: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };

    updatedInvoice.status = determineInvoiceStatus(updatedInvoice);

    setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
    setSelectedInvoice(updatedInvoice);
    setShowMarkSentModal(false);
  };

  const deleteInvoice = () => {
    if (!selectedInvoice) return;
    
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
      setCurrentView('list');
      setSelectedInvoice(null);
    }
  };

  const generateInvoiceHTML = (invoice: Invoice) => {
    try {
      const totalPaid = calculatePaidAmount(invoice);
      const balance = invoice.total - totalPaid;
  
      // Determine status colors with inline styles
      const statusColors = {
        draft: { bg: '#f3f4f6', text: '#1f2937' },
        sent: { bg: '#dbeafe', text: '#1e40af' },
        partial: { bg: '#fef3c7', text: '#92400e' },
        paid: { bg: '#d1fae5', text: '#065f46' },
        overdue: { bg: '#fee2e2', text: '#991b1b' },
        cancelled: { bg: '#f3f4f6', text: '#6b7280' }
      }[invoice.status];
  
      // UPDATED: Complete HTML document with inline CSS for mobile support
      const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        background: #ffffff;
        padding: 16px;
        line-height: 1.5;
        color: #1f2937;
      }
      
      .container {
        max-width: 900px;
        margin: 0 auto;
        background: white;
      }
      
      .no-print {
        margin-bottom: 16px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      
      .btn {
        padding: 10px 24px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-primary {
        background: #2563eb;
        color: white;
      }
      
      .btn-primary:hover {
        background: #1d4ed8;
      }
      
      .btn-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      }
      
      .btn-secondary:hover {
        background: #f9fafb;
      }
      
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid #e5e7eb;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .company-info {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        flex: 1;
        min-width: 250px;
      }
      
      .logo {
        width: 64px;
        height: 64px;
        object-fit: contain;
      }
      
      .company-details h1 {
        font-size: 24px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .company-details p {
        font-size: 14px;
        color: #6b7280;
        margin: 2px 0;
      }
      
      .invoice-title {
        text-align: right;
        min-width: 200px;
      }
      
      .invoice-title h2 {
        font-size: 36px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      .status-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        background: ${statusColors.bg};
        color: ${statusColors.text};
      }
      
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
      }
      
      .bill-to {
        background: #f3f4f6;
        padding: 16px;
        border-radius: 8px;
      }
      
      .bill-to h3 {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }
      
      .bill-to p {
        font-size: 14px;
        color: #1f2937;
        margin: 4px 0;
      }
      
      .bill-to .client-name {
        font-weight: 500;
      }
      
      .invoice-meta {
        text-align: right;
      }
      
      .invoice-meta p {
        font-size: 14px;
        margin: 4px 0;
      }
      
      .invoice-meta .label {
        color: #6b7280;
      }
      
      .invoice-meta .value {
        font-weight: 600;
        color: #1f2937;
        margin-left: 8px;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 32px;
        overflow-x: auto;
        display: block;
      }
      
      .items-table table {
        width: 100%;
        min-width: 600px;
      }
      
      .items-table thead {
        border-bottom: 2px solid #d1d5db;
      }
      
      .items-table th {
        padding: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }
      
      .items-table th:first-child {
        text-align: left;
      }
      
      .items-table th:nth-child(2) {
        text-align: center;
      }
      
      .items-table th:nth-child(3),
      .items-table th:nth-child(4),
      .items-table th:nth-child(5) {
        text-align: right;
      }
      
      .items-table tbody tr {
        border-bottom: 1px solid #e5e7eb;
      }
      
      .items-table td {
        padding: 12px;
        font-size: 14px;
        color: #1f2937;
      }
      
      .items-table td:first-child {
        text-align: left;
      }
      
      .items-table td:nth-child(2) {
        text-align: center;
      }
      
      .items-table td:nth-child(3),
      .items-table td:nth-child(4) {
        text-align: right;
      }
      
      .items-table td:nth-child(5) {
        text-align: right;
        font-weight: 500;
      }
      
      .summary-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        padding-top: 24px;
        border-top: 2px solid #e5e7eb;
        margin-bottom: 32px;
      }
      
      .payment-instructions h3 {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }
      
      .payment-instructions p {
        font-size: 14px;
        color: #6b7280;
        white-space: pre-line;
        line-height: 1.6;
      }
      
      .financial-summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
      }
      
      .summary-row .label {
        color: #6b7280;
      }
      
      .summary-row .value {
        font-weight: 500;
        color: #1f2937;
      }
      
      .summary-row.total {
        border-top: 2px solid #e5e7eb;
        padding-top: 12px;
        font-weight: bold;
        font-size: 16px;
      }
      
      .amount-due-box {
        background: #f3f4f6;
        padding: 16px;
        border-radius: 8px;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .amount-due-box .label {
        font-size: 14px;
        color: #6b7280;
      }
      
      .amount-due-box .amount {
        font-size: 32px;
        font-weight: bold;
        color: #1f2937;
      }
      
      .notes-section {
        background: #f9fafb;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 32px;
      }
      
      .notes-section h3 {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }
      
      .notes-section p {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
      }
      
      .footer {
        text-align: center;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
        margin-top: 32px;
        font-size: 13px;
        color: #9ca3af;
      }
      
      .footer p {
        margin: 4px 0;
      }
      
      @media print {
        body {
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
      }
      
      @media (max-width: 768px) {
        body {
          padding: 12px;
        }
        
        .invoice-header {
          flex-direction: column;
        }
        
        .invoice-title {
          text-align: left;
        }
        
        .invoice-title h2 {
          font-size: 28px;
        }
        
        .details-grid {
          grid-template-columns: 1fr;
        }
        
        .invoice-meta {
          text-align: left;
        }
        
        .summary-section {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        
        .company-details h1 {
          font-size: 20px;
        }
        
        .amount-due-box .amount {
          font-size: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      
      <!-- Print Buttons -->
      <div class="no-print">
        <button onclick="window.print()" class="btn btn-primary">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" class="btn btn-secondary">
          Close
        </button>
      </div>
      
      <!-- Invoice Header -->
      <div class="invoice-header">
        <div class="company-info">
          ${logo ? `<img src="${logo}" alt="Logo" class="logo" />` : ''}
          <div class="company-details">
            <h1>${companyName}</h1>
            <p>${companyAddress}</p>
            <p>${companyEmail}</p>
            <p>${companyPhone}</p>
            ${companyWebsite ? `<p>${companyWebsite}</p>` : ''}
          </div>
        </div>
        
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <span class="status-badge">${invoice.status.toUpperCase()}</span>
        </div>
      </div>
      
      <!-- Bill To and Invoice Details -->
      <div class="details-grid">
        <div class="bill-to">
          <h3>BILL TO</h3>
          <p class="client-name">${invoice.clientName}</p>
          ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
          ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
          ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ''}
        </div>
        
        <div class="invoice-meta">
          <p><span class="label">Invoice #:</span><span class="value">${invoice.invoiceNumber}</span></p>
          <p><span class="label">Date:</span><span class="value">${new Date(invoice.invoiceDate).toLocaleDateString()}</span></p>
          <p><span class="label">Due Date:</span><span class="value">${new Date(invoice.dueDate).toLocaleDateString()}</span></p>
        </div>
      </div>
      
      <!-- Items Table -->
      <div class="items-table">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>GH₵${item.unitPrice.toFixed(2)}</td>
                <td>${item.discount > 0 ? 'GH₵' + item.discount.toFixed(2) : '-'}</td>
                <td>GH₵${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Summary Section -->
      <div class="summary-section">
        <!-- Payment Instructions -->
        ${invoice.terms ? `
          <div class="payment-instructions">
            <h3>Payment Instruction</h3>
            <p>${invoice.terms}</p>
          </div>
        ` : '<div></div>'}
        
        <!-- Financial Summary -->
        <div class="financial-summary">
          <div class="summary-row">
            <span class="label">Subtotal</span>
            <span class="value">GH₵${invoice.subtotal.toFixed(2)}</span>
          </div>
          
          ${invoice.taxRate > 0 ? `
            <div class="summary-row">
              <span class="label">Tax (${invoice.taxRate}%)</span>
              <span class="value">GH₵${invoice.taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          
          <div class="summary-row total">
            <span class="label">Total</span>
            <span class="value">GH₵${invoice.total.toFixed(2)}</span>
          </div>
          
          ${invoice.payments.map(payment => `
            <div class="summary-row">
              <span class="label">Paid on ${new Date(payment.paymentDate).toLocaleDateString()}</span>
              <span class="value">GH₵${payment.amountPaid.toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div class="amount-due-box">
            <span class="label">Amount Due</span>
            <span class="amount">GH₵${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      ${invoice.notes ? `
        <div class="notes-section">
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
    </div>
  </body>
  </html>
      `.trim();
  
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.html`;
      link.click();
      URL.revokeObjectURL(url);
  
      // Log activity
      if (selectedInvoice?.id === invoice.id) {
        const updatedInvoice = {
          ...invoice,
          activities: [
            ...invoice.activities,
            {
              id: generateUUID(),
              type: 'viewed' as const,
              description: 'Invoice HTML downloaded',
              timestamp: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        };
        setInvoices(invoices.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
        setSelectedInvoice(updatedInvoice);
      }
  
    } catch (error) {
      console.error('HTML Generation Error:', error);
      alert('Failed to generate HTML. Check console for details.');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ invoices, settings: { companyName, companyAddress, companyEmail, companyPhone, companyWebsite, theme: customTheme, logo } }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.invoices) setInvoices(data.invoices);
          if (data.settings) {
            if (data.settings.companyName) setCompanyName(data.settings.companyName);
            if (data.settings.companyAddress) setCompanyAddress(data.settings.companyAddress);
            if (data.settings.companyEmail) setCompanyEmail(data.settings.companyEmail);
            if (data.settings.companyPhone) setCompanyPhone(data.settings.companyPhone);
            if (data.settings.companyWebsite) setCompanyWebsite(data.settings.companyWebsite);
            if (data.settings.theme) setCustomTheme(data.settings.theme);
            if (data.settings.logo) setLogo(data.settings.logo);
          }
          alert('Data imported successfully!');
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const saveSettings = () => {
    setCompanyName(tempCompanyName);
    setCompanyAddress(tempCompanyAddress);
    setCompanyEmail(tempCompanyEmail);
    setCompanyPhone(tempCompanyPhone);
    setCompanyWebsite(tempCompanyWebsite);
    setShowSettings(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background}`}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {logo && <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{companyName}</h1>
                <p className="text-gray-600 text-sm">{companyAddress}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Edit className="inline w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={() => setShowThemeBuilder(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Palette className="inline w-4 h-4 mr-2" />
                Theme
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setCurrentView('list')}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition ${
              currentView === 'list' ? theme.primary : 'hover:bg-gray-100'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => {
              setCurrentView('create');
              setFormData({
                clientName: '',
                clientAddress: '',
                clientEmail: '',
                clientPhone: '',
                invoiceDate: new Date().toISOString().split('T')[0],
                dueDate: '',
                items: [{ id: generateUUID(), description: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }],
                notes: '',
                terms: 'Payment is due within 30 days',
                taxRate: 0
              });
            }}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition ${
              currentView === 'create' ? theme.primary : 'hover:bg-gray-100'
            }`}
          >
            <Plus className="inline w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>

        {/* Invoice List */}
        {currentView === 'list' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">All Invoices</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                >
                  <Download className="inline w-4 h-4 mr-2" />
                  Export Data
                </button>
                <label className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium cursor-pointer">
                  <Upload className="inline w-4 h-4 mr-2" />
                  Import Data
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No invoices yet</h3>
                <p className="text-gray-500 mb-6">Create your first invoice to get started</p>
                <button
                  onClick={() => setCurrentView('create')}
                  className={`${theme.primary} px-6 py-3 rounded-lg font-medium`}
                >
                  <Plus className="inline w-5 h-5 mr-2" />
                  Create Invoice
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition cursor-pointer"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setCurrentView('view');
                    }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{invoice.invoiceNumber}</h3>
                            <p className="text-gray-600">{invoice.clientName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(invoice.status)}`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                          <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">GH₵ {invoice.total.toFixed(2)}</p>
                        {calculatePaidAmount(invoice) > 0 && (
                          <p className="text-sm text-green-600 font-medium">
                            Paid: GH₵ {calculatePaidAmount(invoice).toFixed(2)}
                          </p>
                        )}
                        {invoice.status === 'overdue' && (
                          <p className="text-sm text-red-600 font-medium mt-1">
                            Overdue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Invoice */}
        {currentView === 'create' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h2>
            
            <div className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Address</label>
                    <input
                      type="text"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter client address"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Items - UPDATED with Discount Column */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Items</h3>
                  <button
                    onClick={addItem}
                    className={`${theme.primary} px-4 py-2 rounded-lg text-sm font-medium`}
                  >
                    <Plus className="inline w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-start bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Item description"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Qty"
                            min="1"
                            step="1"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Price"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        {/* NEW: Discount Input */}
                        <div>
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Discount"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <p className="text-sm font-medium text-gray-700 py-2">GH₵ {item.amount.toFixed(2)}</p>
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-right max-w-md ml-auto">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">GH₵ {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {formData.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                        <span className="font-medium">GH₵ {calculateTax(calculateSubtotal(), formData.taxRate).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>GH₵ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Add any additional notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Payment terms..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setCurrentView('list')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createInvoice}
                  className={`flex-1 ${theme.primary} px-6 py-3 rounded-lg font-medium`}
                >
                  <Plus className="inline w-5 h-5 mr-2" />
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Invoice */}
        {currentView === 'view' && selectedInvoice && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <button
                  onClick={() => setCurrentView('list')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Back to invoices
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showActionsMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                      {!selectedInvoice.sentDate && (
                        <button
                          onClick={() => {
                            setShowMarkSentModal(true);
                            setShowActionsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Mark as Sent
                        </button>
                      )}
                      <button
                        onClick={() => {
                          deleteInvoice();
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Invoice
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {logo && <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-4" />}
                    <h2 className="text-3xl font-bold text-gray-800">{companyName}</h2>
                    <p className="text-gray-600 text-sm mt-1">{companyAddress}</p>
                    <p className="text-gray-600 text-sm">{companyEmail}</p>
                    <p className="text-gray-600 text-sm">{companyPhone}</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* UPDATED: Bill To with gray background */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">BILL TO</h3>
                    <p className="font-medium">{selectedInvoice.clientName}</p>
                    <p className="text-sm text-gray-600">{selectedInvoice.clientAddress}</p>
                    <p className="text-sm text-gray-600">{selectedInvoice.clientEmail}</p>
                    {selectedInvoice.clientPhone && (
                      <p className="text-sm text-gray-600">{selectedInvoice.clientPhone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <p><span className="font-semibold">Invoice #:</span> {selectedInvoice.invoiceNumber}</p>
                      <p><span className="font-semibold">Date:</span> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                      {selectedInvoice.sentDate && (
                        <p><span className="font-semibold">Sent:</span> {new Date(selectedInvoice.sentDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table - UPDATED with Discount Column */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-3 text-gray-700">Item</th>
                      <th className="text-center p-3 text-gray-700">Quantity</th>
                      <th className="text-right p-3 text-gray-700">Price</th>
                      <th className="text-right p-3 text-gray-700">Discount</th>
                      <th className="text-right p-3 text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">GH₵{item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          {item.discount > 0 ? `GH₵${item.discount.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 text-right font-medium">GH₵{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* UPDATED: Financial Summary with Payment Instructions */}
              <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Instructions - Left Side */}
                {selectedInvoice.terms && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Instruction</h3>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {selectedInvoice.terms}
                    </div>
                  </div>
                )}

                {/* Financial Summary - Right Side */}
                <div className="space-y-2">
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">GH₵{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {selectedInvoice.taxRate > 0 && (
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-600">Tax ({selectedInvoice.taxRate}%)</span>
                      <span className="font-medium">GH₵{selectedInvoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-2 pb-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">GH₵{selectedInvoice.total.toFixed(2)}</span>
                  </div>

                  {/* Payment Records */}
                  {selectedInvoice.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Paid on {new Date(payment.paymentDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium">GH₵{payment.amountPaid.toFixed(2)}</span>
                    </div>
                  ))}

                  {/* UPDATED: Amount Due - Highlighted in Gray Box */}
                  <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Amount Due</span>
                      <span className="text-3xl font-bold text-gray-900">
                        GH₵{(selectedInvoice.total - calculatePaidAmount(selectedInvoice)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => generateInvoiceHTML(selectedInvoice)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition"
                >
                  <Download className="inline w-4 h-4 mr-2" />
                  Download Document
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

            {/* Activity Sidebar */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Log</h3>
              <p className="text-sm text-gray-500 mb-4">Track all actions on this invoice</p>
              
              <div className="space-y-3">
                {selectedInvoice.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg h-fit ${
                      activity.type === 'payment' ? 'bg-green-100' : 
                      activity.type === 'sent' ? theme.secondary : 
                      activity.type === 'created' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'payment' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                       activity.type === 'sent' ? <Send className={`w-4 h-4 ${theme.accent.split(' ')[1]}`} /> :
                       activity.type === 'created' ? <Plus className="w-4 h-4 text-blue-600" /> :
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

              {/* Payment History */}
              {selectedInvoice.payments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((payment) => (
                      <div key={payment.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-green-800">GH₵ {payment.amountPaid.toFixed(2)}</span>
                          <span className="text-xs text-green-600">{payment.paymentMethod}</span>
                        </div>
                        <p className="text-xs text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        {payment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-bold">GH₵ {selectedInvoice.total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Balance Due</p>
                  <p className="font-bold text-red-600">GH₵ {(selectedInvoice.total - calculatePaidAmount(selectedInvoice)).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid *</label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method</option>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Add any notes about this payment..."
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
                  <DollarSign className="inline w-4 h-4 mr-2" />
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Sent Modal */}
        {showMarkSentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Mark Invoice as Sent</h3>
                <button onClick={() => setShowMarkSentModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sent Date</label>
                <input
                  type="date"
                  value={sentDate}
                  onChange={(e) => setSentDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
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
                  <Send className="inline w-4 h-4 mr-2" />
                  Mark as Sent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Company Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {logo && <img src={logo} alt="Logo" className="w-16 h-16 object-contain border rounded" />}
                    <label className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg cursor-pointer text-sm font-medium">
                      <Upload className="inline w-4 h-4 mr-2" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logo && (
                      <button
                        onClick={() => setLogo(null)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={tempCompanyAddress}
                    onChange={(e) => setTempCompanyAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={tempCompanyEmail}
                      onChange={(e) => setTempCompanyEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={tempCompanyPhone}
                      onChange={(e) => setTempCompanyPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    value={tempCompanyWebsite}
                    onChange={(e) => setTempCompanyWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="www.company.com"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setTempCompanyName(companyName);
                    setTempCompanyAddress(companyAddress);
                    setTempCompanyEmail(companyEmail);
                    setTempCompanyPhone(companyPhone);
                    setTempCompanyWebsite(companyWebsite);
                    setShowSettings(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className={`flex-1 ${theme.primary} px-4 py-2 rounded-lg font-medium`}
                >
                  <Save className="inline w-4 h-4 mr-2" />
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
                <h3 className="text-2xl font-bold text-gray-800">Customize Theme</h3>
                <button onClick={() => setShowThemeBuilder(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Primary Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorOptions.primary.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomTheme({ ...customTheme, primary: color.value })}
                        className={`p-4 rounded-lg text-center ${color.classes} ${
                          customTheme.primary === color.value ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-xs font-medium">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Secondary Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorOptions.secondary.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomTheme({ ...customTheme, secondary: color.value })}
                        className={`p-4 rounded-lg text-center ${color.classes} ${
                          customTheme.secondary === color.value ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-xs font-medium">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorOptions.accent.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomTheme({ ...customTheme, accent: color.value })}
                        className={`p-4 rounded-lg text-center border-2 ${color.classes} ${
                          customTheme.accent === color.value ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-xs font-medium">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Background</label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorOptions.background.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomTheme({ ...customTheme, background: color.value })}
                        className={`p-4 rounded-lg text-center bg-gradient-to-br ${color.classes} ${
                          customTheme.background === color.value ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-700">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                  <div className={`p-6 rounded-lg bg-gradient-to-br ${theme.background}`}>
                    <button className={`${theme.primary} px-6 py-3 rounded-lg font-medium mb-3`}>
                      Primary Button
                    </button>
                    <div className={`${theme.secondary} p-4 rounded-lg mb-3`}>
                      Secondary Background
                    </div>
                    <div className={`border-2 ${theme.accent} p-4 rounded-lg`}>
                      Accent Border
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowThemeBuilder(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}