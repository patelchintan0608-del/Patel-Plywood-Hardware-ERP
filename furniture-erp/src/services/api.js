import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Safe date formatter to prevent RangeError: Invalid time value crashes
const formatDateString = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'string') return val.split('T')[0];
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return fallback;
  }
};

// Normalization helpers to maintain consistent schema across backend & UI
const normalizeCustomer = (c) => {
  if (!c) return null;
  const id = c.id || c.customerId || c._id;
  const companyName = c.companyName || c.name || 'Company';
  const customerName = c.customerName || c.contactPerson || companyName;
  const email = c.email || '';
  const phone = c.phone || '';
  const gstNumber = c.gstNumber || c.gstin || '';
  const customerType = c.customerType || c.category || 'Commercial Retailer';
  const createdDate = formatDateString(c.createdDate || c.joinedDate || c.createdAt, new Date().toISOString().split('T')[0]);
  const address = c.address || (c.billingAddress?.street ? `${c.billingAddress.street}, ${c.billingAddress.city}` : '');

  return {
    ...c,
    id,
    _id: c._id || c.id,
    customerId: id,
    companyName,
    name: companyName,
    customerName,
    contactPerson: customerName,
    email,
    phone,
    address,
    city: c.city || c.billingAddress?.city || '',
    state: c.state || c.billingAddress?.state || '',
    gstNumber,
    gstin: gstNumber,
    customerType,
    category: customerType,
    createdDate,
    joinedDate: createdDate,
    creditLimit: Number(c.creditLimit || 0),
    outstandingBalance: Number(c.outstandingBalance || 0),
    status: c.status || 'Active',
    contactPersons: c.contactPersons || [
      { id: 1, name: customerName, designation: 'Primary Contact', email, phone, isPrimary: true }
    ],
    billingAddress: c.billingAddress || { street: address, city: c.city || '', state: c.state || '', pincode: '', country: 'India' },
    shippingAddress: c.shippingAddress || c.billingAddress || { street: address, city: c.city || '', state: c.state || '', pincode: '', country: 'India' },
    history: c.history || []
  };
};

const formatQuotationId = (val, fallback = 'QN-0001') => {
  if (!val) return fallback;
  const str = String(val).trim();
  if (/^QN-\d+$/i.test(str)) {
    const num = str.replace(/QN-/i, '');
    return `QN-${String(parseInt(num, 10)).padStart(4, '0')}`;
  }
  if (/^QT-/i.test(str)) {
    const digits = str.match(/\d+/g);
    if (digits && digits.length > 0) {
      const lastSeq = digits[digits.length - 1];
      return `QN-${String(parseInt(lastSeq, 10)).padStart(4, '0')}`;
    }
  }
  if (/^\d+$/.test(str)) {
    return `QN-${String(parseInt(str, 10)).padStart(4, '0')}`;
  }
  const match = str.match(/\d+/);
  if (match && !/^[0-9a-fA-F]{24}$/.test(str)) {
    return `QN-${String(parseInt(match[0], 10)).padStart(4, '0')}`;
  }
  return fallback;
};

const normalizeQuotation = (q) => {
  if (!q) return null;
  const rawQn = q.quotationNumber || q.id;
  const formattedQn = formatQuotationId(rawQn, 'QN-0001');
  return {
    ...q,
    id: formattedQn,
    _id: q._id || q.id,
    quotationNumber: formattedQn,
    customerName: q.customerName || 'Unknown Customer',
    customerId: q.customerId || '',
    date: formatDateString(q.date || q.quotationDate, new Date().toISOString().split('T')[0]),
    validUntil: formatDateString(q.validUntil, ''),
    grandTotal: Number(q.grandTotal || 0),
    subtotal: Number(q.subtotal || 0),
    tax: Number(q.tax || 0),
    discount: Number(q.discount || 0),
    status: q.status || 'Draft',
    items: (q.items || []).map(i => ({
      ...i,
      id: i.id || i._id || Math.random(),
      name: i.name || i.productName || '',
      productName: i.productName || i.name || '',
      qty: Number(i.qty || i.quantity || 1),
      quantity: Number(i.quantity || i.qty || 1),
      unitPrice: Number(i.unitPrice || i.price || 0),
      price: Number(i.price || i.unitPrice || 0),
      total: Number(i.total || 0)
    }))
  };
};

const format5DigitId = (val, fallback = '00001') => {
  if (!val) return fallback;
  const match = String(val).match(/\d+/);
  if (match) {
    return String(parseInt(match[0], 10)).padStart(5, '0');
  }
  return fallback;
};

const normalizeOrder = (o) => {
  if (!o) return null;
  const rawId = o.orderNumber || o.id || o._id;
  const formattedId = format5DigitId(rawId, '00001');
  const custName = o.customerName || (typeof o.customerId === 'object' ? (o.customerId?.companyName || o.customerId?.customerName) : '') || 'Customer';
  const custId = typeof o.customerId === 'object' ? (o.customerId?._id || o.customerId?.id) : o.customerId;
  return {
    ...o,
    id: formattedId,
    _id: o._id || o.id,
    orderNumber: formattedId,
    customerId: custId,
    customerName: custName,
    totalAmount: Number(o.totalAmount || 0),
    orderDate: formatDateString(o.orderDate || o.createdAt, new Date().toISOString().split('T')[0]),
    deliveryDueDate: formatDateString(o.deliveryDueDate, ''),
    status: o.status || 'Pending',
    paymentStatus: o.paymentStatus || 'Pending'
  };
};

const normalizeProduct = (p) => {
  if (!p) return null;
  const id = p.id || p._id || p.sku;
  return {
    ...p,
    id,
    _id: p._id || p.id,
    name: p.name || p.productName || '',
    productName: p.productName || p.name || '',
    unitPrice: Number(p.unitPrice || p.price || 0),
    price: Number(p.price || p.unitPrice || 0),
    unit: p.unit || 'Piece',
    sku: p.sku || id,
    category: p.category || 'Sunmica',
    status: p.status || 'In Stock'
  };
};

const normalizeStock = (s) => {
  if (!s) return null;
  const id = s.id || s._id || s.sku;
  const qty = Number(s.quantity ?? s.stockQuantity ?? s.stock ?? 0);
  const reserved = Number(s.reserved ?? s.reservedQuantity ?? 0);
  const available = Math.max(0, qty - reserved);

  let status = s.status;
  if (qty === 0) status = 'Out of Stock';
  else if (qty < 15) status = 'Low Stock';
  else if (!status) status = 'In Stock';

  return {
    ...s,
    id,
    _id: s._id || s.id,
    name: s.name || s.productName || '',
    productName: s.productName || s.name || '',
    unitPrice: Number(s.unitPrice || s.price || 0),
    price: Number(s.price || s.unitPrice || 0),
    quantity: qty,
    stock: qty,
    stockQuantity: qty,
    reserved,
    reservedQuantity: reserved,
    availableQuantity: available,
    unit: s.unit || 'Sheet (8x4 ft)',
    sku: s.sku || id,
    category: s.category || 'Sunmica',
    warehouseLocation: s.warehouseLocation || 'Main Warehouse - Bay A',
    status
  };
};

const isValidMongoId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

const normalizeDelivery = (d) => {
  if (!d) return null;
  const rawDeliveryId = d.deliveryNumber || d.id || d._id;
  const formattedDeliveryId = format5DigitId(rawDeliveryId, '00001');

  const rawOrderId = typeof d.orderId === 'object' ? d.orderId?._id : d.orderId;
  const mongoOrderId = isValidMongoId(rawOrderId) ? rawOrderId : undefined;

  const rawCustomerId = typeof d.customerId === 'object' ? d.customerId?._id : d.customerId;
  const mongoCustomerId = isValidMongoId(rawCustomerId) ? rawCustomerId : undefined;

  const rawOrderNum = d.orderNumber || (typeof d.orderId === 'object' ? (d.orderId?.orderNumber || d.orderId?._id) : (typeof d.orderId === 'string' && !isValidMongoId(d.orderId) ? d.orderId : undefined));
  const formattedOrderNum = format5DigitId(rawOrderNum, '00001');

  return {
    ...d,
    id: formattedDeliveryId,
    _id: d._id || d.id,
    deliveryNumber: formattedDeliveryId,
    orderId: mongoOrderId,
    customerId: mongoCustomerId,
    orderNumber: formattedOrderNum,
    customerName: d.customerName || (typeof d.customerId === 'object' ? (d.customerId?.companyName || d.customerId?.customerName) : '') || 'Customer',
    destination: d.destination || 'Client Site Address',
    dispatchDate: formatDateString(d.dispatchDate, new Date().toISOString().split('T')[0]),
    estimatedArrival: formatDateString(d.estimatedArrival, ''),
    status: d.status || 'Dispatched',
    driver: d.driver || 'Logistics Driver (+91 98765 01920)',
    vehicleNo: d.vehicleNo || 'GA-01-TRK-7740',
    totalItems: Number(d.totalItems || 1)
  };
};

const normalizeInquiry = (inq) => {
  if (!inq) return null;
  const id = inq.id || inq._id;
  const inquiryId = inq.inquiryId || id;
  return {
    ...inq,
    id,
    _id: inq._id || inq.id,
    inquiryId,
    customerName: inq.customerName || 'Inquirer',
    companyName: inq.companyName || inq.customerName || 'Company',
    phone: inq.phone || '',
    email: inq.email || '',
    source: inq.source || 'Website',
    product: inq.product || 'Furniture',
    category: inq.category || 'Furniture',
    quantity: Number(inq.quantity || 1),
    estimatedBudget: Number(inq.estimatedBudget || 0),
    requirement: inq.requirement || '',
    priority: inq.priority || 'Medium',
    assignedTo: inq.assignedTo || 'Sales Executive',
    status: inq.status || 'New',
    inquiryDate: formatDateString(inq.inquiryDate || inq.createdAt, new Date().toISOString().split('T')[0]),
    expectedDate: formatDateString(inq.expectedDate, ''),
    convertedToLead: Boolean(inq.convertedToLead),
    convertedLeadId: inq.convertedLeadId || ''
  };
};

const normalizeLead = (ld) => {
  if (!ld) return null;
  const id = ld.id || ld._id;
  const leadId = ld.leadId || id;
  return {
    ...ld,
    id,
    _id: ld._id || ld.id,
    leadId,
    leadName: ld.leadName || ld.companyName || 'Lead',
    contactPerson: ld.contactPerson || ld.leadName || 'Contact',
    companyName: ld.companyName || ld.leadName || 'Company',
    phone: ld.phone || '',
    email: ld.email || '',
    source: ld.source || 'Website',
    productInterest: ld.productInterest || 'Modular Sofa',
    category: ld.category || 'Furniture',
    estimatedValue: Number(ld.estimatedValue || 0),
    status: ld.status || 'New',
    priority: ld.priority || 'Medium',
    assignedTo: ld.assignedTo || 'Sales Executive',
    createdDate: formatDateString(ld.createdAt || ld.createdDate, new Date().toISOString().split('T')[0]),
    expectedClosingDate: formatDateString(ld.expectedClosingDate, ''),
    nextFollowUp: formatDateString(ld.nextFollowUp, ''),
    notes: ld.notes || '',
    convertedToCustomer: Boolean(ld.convertedToCustomer),
    convertedCustomerId: ld.convertedCustomerId || '',
    followUps: (ld.followUps || []).map(f => ({
      ...f,
      id: f._id || f.id || Math.random(),
      followUpDate: formatDateString(f.followUpDate, new Date().toISOString().split('T')[0]),
      followUpTime: f.followUpTime || '11:30 AM',
      followUpType: f.followUpType || 'Phone Call',
      assignedEmployee: f.assignedEmployee || 'Sales Executive',
      remarks: f.remarks || '',
      status: f.status || 'Pending'
    })),
    activityTimeline: (ld.activityTimeline || []).map(a => ({
      ...a,
      id: a._id || a.id || Math.random(),
      date: formatDateString(a.date, new Date().toISOString().split('T')[0]),
      title: a.title || 'Activity',
      description: a.description || '',
      author: a.author || 'System'
    }))
  };
};

// API Services object - integrated directly with express backend
export const api = {
  // Customers
  getCustomers: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeCustomer);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch customers:", err?.message);
      return [];
    }
  },

  getCustomerById: async (id) => {
    try {
      if (id && id.length === 24) {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}`);
        if (res.data?.data) return normalizeCustomer(res.data.data);
      }
      const all = await api.getCustomers();
      return all.find(c => c.id === id || c._id === id || c.customerId === id);
    } catch (err) {
      const all = await api.getCustomers();
      return all.find(c => c.id === id || c._id === id || c.customerId === id);
    }
  },

  saveCustomer: async (customer) => {
    try {
      const primaryContact = customer.contactPersons && customer.contactPersons.length > 0
        ? customer.contactPersons.find(p => p.isPrimary) || customer.contactPersons[0]
        : null;

      const companyName = customer.companyName || customer.name || 'Company';
      const customerName = primaryContact ? primaryContact.name : (customer.customerName || customer.contactPerson || '');
      const email = primaryContact ? primaryContact.email : (customer.email || '');
      const phone = primaryContact ? primaryContact.phone : (customer.phone || '');
      const gstNumber = customer.gstNumber || customer.gstin || '';
      const customerType = customer.customerType || customer.category || 'Commercial Retailer';
      const createdDate = customer.createdDate || customer.joinedDate || new Date().toISOString().split('T')[0];
      const customerId = customer.customerId || customer.id || `CUST-${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        ...customer,
        customerId,
        companyName,
        customerName,
        contactPerson: customerName,
        email,
        phone,
        gstNumber,
        gstin: gstNumber,
        customerType,
        category: customerType,
        createdDate,
        joinedDate: createdDate,
        creditLimit: Number(customer.creditLimit || 0),
        outstandingBalance: Number(customer.outstandingBalance || 0),
        status: customer.status || 'Active'
      };

      let res;
      if (customer._id) {
        res = await axios.put(`${API_BASE_URL}/customers/${customer._id}`, payload);
      } else {
        const all = await api.getCustomers();
        const existing = all.find(c => c.id === customerId || c.customerId === customerId);
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/customers/${existing._id}`, payload);
        } else {
          res = await axios.post(`${API_BASE_URL}/customers`, payload);
        }
      }
      return res.data?.data ? normalizeCustomer(res.data.data) : payload;
    } catch (err) {
      console.error("Failed to save customer:", err);
      throw err;
    }
  },

  toggleCustomerStatus: async (id, newStatus) => {
    try {
      const cust = await api.getCustomerById(id);
      if (!cust) return await api.getCustomers();
      const historyItem = {
        id: `ACT-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        title: `Status Changed to ${newStatus}`,
        type: 'status',
        description: `Customer status updated from ${cust.status} to ${newStatus}.`,
        author: 'User'
      };
      const updatedCust = {
        ...cust,
        status: newStatus,
        history: [historyItem, ...(cust.history || [])]
      };
      if (cust._id) {
        await axios.put(`${API_BASE_URL}/customers/${cust._id}`, updatedCust);
      }
      return await api.getCustomers();
    } catch (err) {
      console.error("Failed to toggle customer status:", err);
      return await api.getCustomers();
    }
  },

  addCustomerActivity: async (id, activity) => {
    try {
      const cust = await api.getCustomerById(id);
      if (!cust) return await api.getCustomers();
      const newActivity = {
        id: `ACT-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        author: 'User',
        ...activity
      };
      const updatedCust = {
        ...cust,
        history: [newActivity, ...(cust.history || [])]
      };
      if (cust._id) {
        await axios.put(`${API_BASE_URL}/customers/${cust._id}`, updatedCust);
      }
      return await api.getCustomers();
    } catch (err) {
      console.error("Failed to add customer activity:", err);
      return await api.getCustomers();
    }
  },

  deleteCustomer: async (id) => {
    try {
      const cust = await api.getCustomerById(id);
      if (cust && cust._id) {
        await axios.delete(`${API_BASE_URL}/customers/${cust._id}`);
      }
      return await api.getCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
      return await api.getCustomers();
    }
  },

  // Quotations
  getQuotations: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/quotations`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeQuotation);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch quotations:", err?.message);
      return [];
    }
  },

  getQuotationById: async (id) => {
    try {
      if (id && id.length === 24) {
        const res = await axios.get(`${API_BASE_URL}/quotations/${id}`);
        if (res.data?.data) return normalizeQuotation(res.data.data);
      }
      const all = await api.getQuotations();
      return all.find(q => q.id === id || q._id === id || q.quotationNumber === id);
    } catch (err) {
      const all = await api.getQuotations();
      return all.find(q => q.id === id || q._id === id || q.quotationNumber === id);
    }
  },

  saveQuotation: async (quote) => {
    try {
      let res;
      if (quote._id) {
        res = await axios.put(`${API_BASE_URL}/quotations/${quote._id}`, quote);
      } else {
        const all = await api.getQuotations();
        const existing = all.find(q => q.id === quote.id || q.quotationNumber === quote.id);
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/quotations/${existing._id}`, quote);
        } else {
          res = await axios.post(`${API_BASE_URL}/quotations`, quote);
        }
      }
      const saved = res.data?.data ? normalizeQuotation(res.data.data) : quote;
      if (saved.customerId) {
        await api.addCustomerActivity(saved.customerId, {
          title: `Quotation ${saved.id || saved.quotationNumber} Updated`,
          type: 'quotation',
          description: `Quotation worth ₹${(saved.grandTotal || 0).toLocaleString('en-IN')} (${saved.status || 'Draft'}).`,
          author: 'Sales'
        }).catch(() => { });
      }
      return saved;
    } catch (err) {
      console.error("Failed to save quotation:", err);
      throw err;
    }
  },

  updateQuotationStatus: async (id, newStatus) => {
    try {
      const quote = await api.getQuotationById(id);
      if (!quote) return await api.getQuotations();
      const updatedQ = { ...quote, status: newStatus };
      if (quote._id) {
        await axios.put(`${API_BASE_URL}/quotations/${quote._id}`, updatedQ);
      }
      if (quote.customerId) {
        await api.addCustomerActivity(quote.customerId, {
          title: `Quotation ${id} Status Changed to ${newStatus}`,
          type: 'quotation',
          description: `Status updated to ${newStatus}.`,
          author: 'User'
        }).catch(() => { });
      }
      return await api.getQuotations();
    } catch (err) {
      console.error("Failed to update quotation status:", err);
      return await api.getQuotations();
    }
  },

  acceptQuotation: async (quotationId) => {
    try {
      // First update quotation status
      await axios.put(
        `${API_BASE_URL}/quotations/${quotationId}`,
        {
          status: "Accepted",
        }
      );

      // Then create Sales Order
      const response = await axios.post(
        `${API_BASE_URL}/orders/from-quotation/${quotationId}`
      );

      alert("Quotation accepted and Sales Order created!");

      console.log(response.data.order || response.data);
      return response.data;

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to create Sales Order"
      );
      throw error;
    }
  },

  // Real-time Stock Flow Validation & Deduction for Quotation
  checkStockForQuotation: async (items) => {
    try {
      const [products, stocks] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getStocks().catch(() => [])
      ]);

      const allInventory = [...products, ...stocks];
      const insufficientItems = [];

      for (const item of items) {
        const reqQty = Number(item.qty || item.quantity || 1);
        if (reqQty <= 0) continue;

        const targetProd = allInventory.find(p => 
          (item.productId && (p.id === item.productId || p._id === item.productId || p.sku === item.productId)) ||
          (item.name && p.productName && p.productName.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
          (item.productName && p.productName && p.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
        );

        if (targetProd) {
          const physicalQty = Number(targetProd.stockQuantity ?? targetProd.stock ?? targetProd.quantity ?? 0);
          const reservedQty = Number(targetProd.reservedQuantity ?? targetProd.reserved ?? 0);
          const availableQty = Math.max(0, physicalQty - reservedQty);

          if (reqQty > availableQty) {
            insufficientItems.push({
              name: item.name || item.productName || targetProd.productName || 'Inventory Item',
              requested: reqQty,
              available: availableQty,
              physical: physicalQty,
              reserved: reservedQty
            });
          }
        }
      }

      return {
        valid: insufficientItems.length === 0,
        insufficientItems
      };
    } catch (err) {
      console.error("checkStockForQuotation error:", err);
      return { valid: true, insufficientItems: [] };
    }
  },

  deductStockForQuotation: async (items) => {
    try {
      const [products, stocks] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getStocks().catch(() => [])
      ]);

      for (const item of items) {
        const deductQty = Number(item.qty || item.quantity || 1);
        if (deductQty <= 0) continue;

        // Deduct in Products MongoDB collection
        const matchedProd = products.find(p => 
          (item.productId && (p.id === item.productId || p._id === item.productId || p.sku === item.productId)) ||
          (item.name && p.productName && p.productName.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
          (item.productName && p.productName && p.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
        );

        if (matchedProd && matchedProd._id) {
          const currentQty = Number(matchedProd.stockQuantity ?? matchedProd.stock ?? matchedProd.quantity ?? 0);
          const newQty = Math.max(0, currentQty - deductQty);
          let newStatus = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= 10) newStatus = 'Low Stock';

          await axios.put(`${API_BASE_URL}/products/${matchedProd._id}`, {
            ...matchedProd,
            stockQuantity: newQty,
            stock: newQty,
            quantity: newQty,
            status: newStatus
          }).catch(e => console.error("Failed to update product stock:", e));
        }

        // Deduct in Stocks MongoDB collection
        const matchedStock = stocks.find(s => 
          (item.productId && (s.id === item.productId || s._id === item.productId || s.sku === item.productId)) ||
          (item.name && s.productName && s.productName.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
          (item.productName && s.productName && s.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
        );

        if (matchedStock && matchedStock._id) {
          const currentQty = Number(matchedStock.stockQuantity ?? matchedStock.stock ?? matchedStock.quantity ?? 0);
          const newQty = Math.max(0, currentQty - deductQty);
          let newStatus = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= 10) newStatus = 'Low Stock';

          await axios.put(`${API_BASE_URL}/stocks/${matchedStock._id}`, {
            ...matchedStock,
            stockQuantity: newQty,
            stock: newQty,
            quantity: newQty,
            status: newStatus
          }).catch(e => console.error("Failed to update stock:", e));
        }
      }
    } catch (err) {
      console.error("deductStockForQuotation error:", err);
    }
  },

  restoreStockForQuotation: async (items) => {
    try {
      const [products, stocks] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getStocks().catch(() => [])
      ]);

      for (const item of items) {
        const restoreQty = Number(item.qty || item.quantity || 1);
        if (restoreQty <= 0) continue;

        const matchedProd = products.find(p => 
          (item.productId && (p.id === item.productId || p._id === item.productId || p.sku === item.productId)) ||
          (item.name && p.productName && p.productName.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
          (item.productName && p.productName && p.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
        );

        if (matchedProd && matchedProd._id) {
          const currentQty = Number(matchedProd.stockQuantity ?? matchedProd.stock ?? matchedProd.quantity ?? 0);
          const newQty = currentQty + restoreQty;
          let newStatus = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= 10) newStatus = 'Low Stock';

          await axios.put(`${API_BASE_URL}/products/${matchedProd._id}`, {
            ...matchedProd,
            stockQuantity: newQty,
            stock: newQty,
            quantity: newQty,
            status: newStatus
          }).catch(e => console.error("Failed to restore product stock:", e));
        }

        const matchedStock = stocks.find(s => 
          (item.productId && (s.id === item.productId || s._id === item.productId || s.sku === item.productId)) ||
          (item.name && s.productName && s.productName.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
          (item.productName && s.productName && s.productName.toLowerCase().trim() === item.productName.toLowerCase().trim())
        );

        if (matchedStock && matchedStock._id) {
          const currentQty = Number(matchedStock.stockQuantity ?? matchedStock.stock ?? matchedStock.quantity ?? 0);
          const newQty = currentQty + restoreQty;
          let newStatus = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= 10) newStatus = 'Low Stock';

          await axios.put(`${API_BASE_URL}/stocks/${matchedStock._id}`, {
            ...matchedStock,
            stockQuantity: newQty,
            stock: newQty,
            quantity: newQty,
            status: newStatus
          }).catch(e => console.error("Failed to restore stock:", e));
        }
      }
    } catch (err) {
      console.error("restoreStockForQuotation error:", err);
    }
  },

  deleteQuotation: async (id) => {
    try {
      const quote = await api.getQuotationById(id);
      if (quote) {
        if (quote.items && quote.items.length > 0) {
          await api.restoreStockForQuotation(quote.items);
        }
        if (quote._id) {
          await axios.delete(`${API_BASE_URL}/quotations/${quote._id}`);
        }
      }
      return await api.getQuotations();
    } catch (err) {
      console.error("Failed to delete quotation:", err);
      return await api.getQuotations();
    }
  },

  // Sales Orders
  getOrders: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeOrder);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch orders:", err?.message);
      return [];
    }
  },

  getOrderById: async (id) => {
    try {
      if (id && id.length === 24) {
        const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
        if (res.data?.data) return normalizeOrder(res.data.data);
      }
      const all = await api.getOrders();
      return all.find(o => o.id === id || o._id === id || o.orderNumber === id);
    } catch (err) {
      const all = await api.getOrders();
      return all.find(o => o.id === id || o._id === id || o.orderNumber === id);
    }
  },

  saveOrder: async (order) => {
    try {
      let res;
      if (order._id) {
        res = await axios.put(`${API_BASE_URL}/orders/${order._id}`, order);
      } else {
        const all = await api.getOrders();
        const existing = all.find(o => o.id === order.id || o.orderNumber === order.id || (order.orderNumber && o.orderNumber === order.orderNumber));
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/orders/${existing._id}`, order);
        } else {
          res = await axios.post(`${API_BASE_URL}/orders`, order);
        }
      }
      return res.data?.data ? normalizeOrder(res.data.data) : order;
    } catch (err) {
      console.error("Failed to save order:", err);
      throw err;
    }
  },

  createOrderFromQuotation: async (quotationId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/orders/from-quotation/${quotationId}`);
      return res.data?.data ? normalizeOrder(res.data.data) : res.data;
    } catch (err) {
      console.error("Failed to create order from quotation:", err);
      throw err;
    }
  },

  deleteOrder: async (id) => {
    try {
      const order = await api.getOrderById(id);
      if (order && order._id) {
        await axios.delete(`${API_BASE_URL}/orders/${order._id}`);
      }
      return await api.getOrders();
    } catch (err) {
      console.error("Failed to delete order:", err);
      return await api.getOrders();
    }
  },

  // Products
  getProducts: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeProduct);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch products:", err?.message);
      return [];
    }
  },

  getProductById: async (id) => {
    try {
      const all = await api.getProducts();
      return all.find(p => p.id === id || p._id === id || p.sku === id);
    } catch (err) {
      console.error("Failed to get product by id:", err);
    }
  },

  saveProduct: async (product) => {
    try {
      const payload = {
        ...product,
        productName: product.name || product.productName,
        price: Number(product.unitPrice || product.price || 0)
      };
      let res;
      if (product._id) {
        res = await axios.put(`${API_BASE_URL}/products/${product._id}`, payload);
      } else {
        const all = await api.getProducts();
        const existing = all.find(p => p.id === product.id || p.sku === product.sku);
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/products/${existing._id}`, payload);
        } else {
          res = await axios.post(`${API_BASE_URL}/products`, payload);
        }
      }
      return res.data?.data ? normalizeProduct(res.data.data) : product;
    } catch (err) {
      console.error("Failed to save product:", err);
      throw err;
    }
  },

  deleteProduct: async (id) => {
    try {
      const prod = await api.getProductById(id);
      if (prod && prod._id) {
        await axios.delete(`${API_BASE_URL}/products/${prod._id}`);
      }
      return await api.getProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      return await api.getProducts();
    }
  },

  // Stocks Overview (Dedicated MongoDB collection)
  getStocks: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stocks`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeStock);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch stocks:", err?.message);
      return [];
    }
  },

  getStockById: async (id) => {
    try {
      const all = await api.getStocks();
      return all.find(s => s.id === id || s._id === id || s.sku === id);
    } catch (err) {
      console.error("Failed to get stock by id:", err);
    }
  },

  saveStock: async (stock) => {
    try {
      const payload = {
        ...stock,
        productName: stock.name || stock.productName,
        price: Number(stock.unitPrice || stock.price || 0)
      };
      let res;
      if (stock._id) {
        res = await axios.put(`${API_BASE_URL}/stocks/${stock._id}`, payload);
      } else {
        const all = await api.getStocks();
        const existing = all.find(s => s.id === stock.id || s.sku === stock.sku);
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/stocks/${existing._id}`, payload);
        } else {
          res = await axios.post(`${API_BASE_URL}/stocks`, payload);
        }
      }
      return res.data?.data ? normalizeStock(res.data.data) : stock;
    } catch (err) {
      console.error("Failed to save stock:", err);
      throw err;
    }
  },

  deleteStock: async (id) => {
    try {
      const stock = await api.getStockById(id);
      if (stock && stock._id) {
        await axios.delete(`${API_BASE_URL}/stocks/${stock._id}`);
      }
      return await api.getStocks();
    } catch (err) {
      console.error("Failed to delete stock:", err);
      return await api.getStocks();
    }
  },

  // Deliveries & Dispatch (MongoDB connected)
  getDeliveries: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deliveries`);
      const items = res.data?.data || res.data || [];
      return items.map(normalizeDelivery);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      return [];
    }
  },

  getDeliveryById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deliveries/${id}`);
      return res.data?.data ? normalizeDelivery(res.data.data) : null;
    } catch (err) {
      console.error("Failed to fetch delivery:", err);
      return null;
    }
  },

  saveDelivery: async (delivery) => {
    try {
      const payload = { ...delivery };
      if (payload.orderId && !/^[0-9a-fA-F]{24}$/.test(String(payload.orderId))) {
        delete payload.orderId;
      }
      if (payload.customerId && !/^[0-9a-fA-F]{24}$/.test(String(payload.customerId))) {
        delete payload.customerId;
      }

      let res;
      if (payload._id && /^[0-9a-fA-F]{24}$/.test(String(payload._id))) {
        res = await axios.put(`${API_BASE_URL}/deliveries/${payload._id}`, payload);
      } else {
        const all = await api.getDeliveries();
        const existing = all.find(d => d.id === payload.id || d.deliveryNumber === payload.deliveryNumber);
        if (existing && existing._id && /^[0-9a-fA-F]{24}$/.test(String(existing._id))) {
          res = await axios.put(`${API_BASE_URL}/deliveries/${existing._id}`, payload);
        } else {
          res = await axios.post(`${API_BASE_URL}/deliveries`, payload);
        }
      }
      return res.data?.data ? normalizeDelivery(res.data.data) : payload;
    } catch (err) {
      console.error("Failed to save delivery:", err);
      throw err;
    }
  },

  createDeliveryFromOrder: async (orderId, deliveryDetails = {}) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/deliveries/from-order/${orderId}`, deliveryDetails);
      return res.data?.data ? normalizeDelivery(res.data.data) : res.data;
    } catch (err) {
      console.error("Failed to create delivery from order:", err);
      throw err;
    }
  },

  deleteDelivery: async (id) => {
    try {
      const del = await api.getDeliveryById(id);
      if (del && del._id) {
        await axios.delete(`${API_BASE_URL}/deliveries/${del._id}`);
      }
      return await api.getDeliveries();
    } catch (err) {
      console.error("Failed to delete delivery:", err);
      return await api.getDeliveries();
    }
  },

  // Inquiries Module
  getInquiries: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inquiries`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeInquiry);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch inquiries:", err?.message);
      return [];
    }
  },

  getInquiryById: async (id) => {
    try {
      if (id && id.length === 24) {
        const res = await axios.get(`${API_BASE_URL}/inquiries/${id}`);
        if (res.data?.data) return normalizeInquiry(res.data.data);
      }
      const all = await api.getInquiries();
      return all.find(i => i.id === id || i._id === id || i.inquiryId === id);
    } catch (err) {
      const all = await api.getInquiries();
      return all.find(i => i.id === id || i._id === id || i.inquiryId === id);
    }
  },

  saveInquiry: async (inquiry) => {
    try {
      let res;
      if (inquiry._id) {
        res = await axios.put(`${API_BASE_URL}/inquiries/${inquiry._id}`, inquiry);
      } else {
        const all = await api.getInquiries();
        const existing = all.find(i => i.id === inquiry.id || i.inquiryId === inquiry.inquiryId);
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/inquiries/${existing._id}`, inquiry);
        } else {
          res = await axios.post(`${API_BASE_URL}/inquiries`, inquiry);
        }
      }
      return res.data?.data ? normalizeInquiry(res.data.data) : inquiry;
    } catch (err) {
      console.error("Failed to save inquiry:", err);
      throw err;
    }
  },

  convertInquiryToLead: async (id) => {
    try {
      const inq = await api.getInquiryById(id);
      const targetId = (inq && inq._id) ? inq._id : id;
      const res = await axios.post(`${API_BASE_URL}/inquiries/${targetId}/convert-to-lead`);
      return res.data?.data ? normalizeLead(res.data.data) : res.data;
    } catch (err) {
      console.error("Failed to convert inquiry to lead:", err);
      throw err;
    }
  },

  deleteInquiry: async (id) => {
    try {
      const inq = await api.getInquiryById(id);
      if (inq && inq._id) {
        await axios.delete(`${API_BASE_URL}/inquiries/${inq._id}`);
      }
      return await api.getInquiries();
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
      return await api.getInquiries();
    }
  },

  // Leads Module
  getLeads: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leads`);
      const data = res.data?.data || res.data || [];
      return data.map(normalizeLead);
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch leads:", err?.message);
      return [];
    }
  },

  getLeadById: async (id) => {
    try {
      if (id && id.length === 24) {
        const res = await axios.get(`${API_BASE_URL}/leads/${id}`);
        if (res.data?.data) return normalizeLead(res.data.data);
      }
      const all = await api.getLeads();
      return all.find(l => l.id === id || l._id === id || l.leadId === id);
    } catch (err) {
      const all = await api.getLeads();
      return all.find(l => l.id === id || l._id === id || l.leadId === id);
    }
  },

  saveLead: async (lead) => {
    try {
      let res;
      if (lead._id) {
        res = await axios.put(`${API_BASE_URL}/leads/${lead._id}`, lead);
      } else {
        const all = await api.getLeads();
        const existing = all.find(l => l.id === lead.id || l.leadId === lead.leadId);
        if (existing && existing._id) {
          res = await axios.put(`${API_BASE_URL}/leads/${existing._id}`, lead);
        } else {
          res = await axios.post(`${API_BASE_URL}/leads`, lead);
        }
      }
      return res.data?.data ? normalizeLead(res.data.data) : lead;
    } catch (err) {
      console.error("Failed to save lead:", err);
      throw err;
    }
  },

  addLeadFollowUp: async (leadId, followUpData) => {
    try {
      const lead = await api.getLeadById(leadId);
      const targetId = (lead && lead._id) ? lead._id : leadId;
      const res = await axios.post(`${API_BASE_URL}/leads/${targetId}/followup`, followUpData);
      return res.data?.data ? normalizeLead(res.data.data) : res.data;
    } catch (err) {
      console.error("Failed to add follow-up:", err);
      throw err;
    }
  },

  updateFollowUpStatus: async (leadId, followupId, statusData) => {
    try {
      const lead = await api.getLeadById(leadId);
      const targetId = (lead && lead._id) ? lead._id : leadId;
      const res = await axios.put(`${API_BASE_URL}/leads/${targetId}/followup/${followupId}`, statusData);
      return res.data?.data ? normalizeLead(res.data.data) : res.data;
    } catch (err) {
      console.error("Failed to update follow-up status:", err);
      throw err;
    }
  },

  convertLeadToCustomer: async (id) => {
    try {
      const lead = await api.getLeadById(id);
      const targetId = (lead && lead._id) ? lead._id : id;
      const res = await axios.post(`${API_BASE_URL}/leads/${targetId}/convert-to-customer`);
      return res.data;
    } catch (err) {
      console.error("Failed to convert lead to customer:", err);
      throw err;
    }
  },

  deleteLead: async (id) => {
    try {
      const lead = await api.getLeadById(id);
      if (lead && lead._id) {
        await axios.delete(`${API_BASE_URL}/leads/${lead._id}`);
      }
      return await api.getLeads();
    } catch (err) {
      console.error("Failed to delete lead:", err);
      return await api.getLeads();
    }
  },

  // Employees Module
  getEmployees: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`);
      return res.data?.data || res.data || [];
    } catch (err) {
      if (err?.code !== 'ERR_NETWORK') console.warn("Failed to fetch employees:", err?.message);
      return [];
    }
  },

  saveEmployee: async (employeeData) => {
    try {
      let res;
      if (employeeData._id) {
        res = await axios.put(`${API_BASE_URL}/employees/${employeeData._id}`, employeeData);
      } else {
        res = await axios.post(`${API_BASE_URL}/employees`, employeeData);
      }
      return res.data;
    } catch (err) {
      console.error("Failed to save employee:", err);
      throw err;
    }
  },

  createEmployeeLoginAccount: async (accountData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/create-employee`, accountData).catch(() =>
        axios.post(`${API_BASE_URL}/auth/create-account`, accountData)
      );
      return res.data;
    } catch (err) {
      console.error("Failed to create login account:", err);
      throw err;
    }
  },

  deleteEmployee: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/employees/${id}`);
      return await api.getEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      return await api.getEmployees();
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const saved = localStorage.getItem('furniture_erp_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      companyName: 'Patel Plywood & Hardware ERP',
      gstin: '24AAACP7740P1Z8',
      taxRate: 18,
      currency: 'INR (₹)',
      companyAddress: '150 Industrial Timber Way, GIDC, Surat, Gujarat 395007',
      email: 'info@patelplywood.com',
      phone: '+91 98765 43210',
      website: 'www.patelplywood.com',
      bankName: 'HDFC Bank Ltd',
      accountNo: '50200089012345',
      ifscCode: 'HDFC0000124',
      paymentTerms: 'Net 30 Days',
      autoReserveStock: true,
      enableQuotationApproval: true,
      autoDispatchNotification: true,
      require2FA: false,
      sessionTimeoutMinutes: 60
    };
  },

  saveSettings: async (newSettings) => {
    try {
      localStorage.setItem('furniture_erp_settings', JSON.stringify(newSettings));
    } catch (e) {}
    return newSettings;
  }
};
