# Furniture ERP - Complete System Documentation

Welcome to the **Furniture ERP** (Patel Plywood & Hardware ERP v2.4) documentation. This system is a full-stack Enterprise Resource Planning & CRM solution tailored for furniture manufacturers, plywood distributors, and hardware retailers.

---

## 📐 End-to-End Business Flow

The ERP automates the complete lifecycle from initial customer interest to final payment:

```
[ INQUIRY ] ──► [ LEAD ] ──► [ QUALIFIED LEAD ] ──► [ CUSTOMER ] ──► [ QUOTATION ] ──► [ SALES ORDER ] ──► [ DISPATCH ] ──► [ DELIVERY ] ──► [ PAYMENT ]
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 + Vite |
| **Routing** | React Router DOM v6 |
| **Icons & UI** | Lucide React |
| **Styling** | Custom Vanilla CSS (Modern Dark/Light Glassmorphism Theme) |
| **Backend Framework** | Node.js + Express.js (ES Modules) |
| **Database** | MongoDB + Mongoose ORM |
| **HTTP Client** | Axios |

---

## 📦 System Modules & Architecture

### 1. 📥 Inquiry Management Module
An **Inquiry** represents an initial customer request or quote inquiry before qualification (e.g., *"I need 20 office chairs and 5 conference tables. Please send me pricing."*).

#### Mongoose Model (`backend/Models/Inquiry.js`)
* **`inquiryId`**: String (Unique, e.g., `INQ-00001`)
* **`inquiryDate`**: Date (Default: `Date.now`)
* **`customerName`**: String (Required)
* **`companyName`**: String
* **`phone`**: String (Required)
* **`email`**: String
* **`source`**: Enum (`Website`, `WhatsApp`, `Instagram`, `Facebook`, `Google`, `Referral`, `Phone Call`, `Email`, `Exhibition`, `Walk-in`, `Existing Customer`, `Advertisement`, `Other`)
* **`product`**: String
* **`category`**: String (`Office Furniture`, `Furniture`, `Sunmica`, `Plywood`, `MDF`, `Hardware`)
* **`quantity`**: Number
* **`estimatedBudget`**: Number
* **`requirement`**: Text / Requirements
* **`priority`**: Enum (`Low`, `Medium`, `High`)
* **`assignedTo`**: String
* **`status`**: Enum (`New`, `Contacted`, `Under Review`, `Qualified`, `Converted to Lead`, `On Hold`, `Not Interested`, `Rejected`, `Closed`)
* **`convertedToLead`**: Boolean

#### API Endpoints (`/api/inquiries`)
* `GET /api/inquiries` - Fetch all inquiries
* `GET /api/inquiries/:id` - Fetch inquiry details
* `POST /api/inquiries` - Create new inquiry
* `PUT /api/inquiries/:id` - Update inquiry
* `POST /api/inquiries/:id/convert-to-lead` - Convert Inquiry `INQ-XXXXX` to Lead `LD-XXXXX`
* `DELETE /api/inquiries/:id` - Delete inquiry

---

### 2. 🎯 Lead Management Module
A **Lead** represents a qualified sales opportunity that is actively being pursued.

#### Mongoose Model (`backend/Models/Lead.js`)
* **`leadId`**: String (Unique, e.g., `LD-00001`)
* **`leadName`**: String (Required)
* **`contactPerson`**: String
* **`companyName`**: String
* **`phone`**: String (Required)
* **`email`**: String
* **`source`**: String
* **`productInterest`**: String
* **`category`**: String
* **`estimatedValue`**: Number (₹)
* **`status`**: Enum (`New`, `Contacted`, `Qualified`, `Proposal / Quotation`, `Negotiation`, `Won`, `Lost`, `Not Interested`, `On Hold`, `Invalid`)
* **`priority`**: Enum (`Low`, `Medium`, `High`)
* **`assignedTo`**: String
* **`expectedClosingDate`**: Date
* **`notes`**: Text
* **`convertedToCustomer`**: Boolean
* **`followUps`**: Array of follow-up subdocuments
  * `followUpDate`: Date
  * `followUpTime`: String (e.g. `11:30 AM`)
  * `followUpType`: Enum (`Phone Call`, `WhatsApp`, `Email`, `Meeting`, `Site Visit`, `Product Demo`)
  * `assignedEmployee`: String
  * `remarks`: Text
  * `status`: Enum (`Pending`, `Completed`, `Cancelled`)
* **`activityTimeline`**: Array of event logs (`date`, `title`, `description`, `author`)

#### API Endpoints (`/api/leads`)
* `GET /api/leads` - Fetch all leads
* `GET /api/leads/:id` - Fetch lead details with follow-ups & timeline
* `POST /api/leads` - Create lead
* `PUT /api/leads/:id` - Update lead
* `POST /api/leads/:id/followup` - Add follow-up task
* `PUT /api/leads/:id/followup/:followupId` - Update follow-up status (`Pending` -> `Completed`)
* `POST /api/leads/:id/convert-to-customer` - Convert Lead `LD-XXXXX` to Customer `CUS-XXXXX`
* `DELETE /api/leads/:id` - Delete lead

---

### 3. 👥 Customer Management Module
Stores verified customer directory data used across quotations, sales orders, invoices, and ledger accounts.

#### API Endpoints (`/api/customers`)
* `GET /api/customers` - List all customers
* `POST /api/customers` - Add new customer
* `PUT /api/customers/:id` - Update customer record
* `DELETE /api/customers/:id` - Remove customer

---

### 4. 📄 Quotation Engine
Allows creation of official commercial proposals with line items, tax calculations, discounts, and validity dates.

#### API Endpoints (`/api/quotations`)
* `GET /api/quotations` - List all quotations
* `POST /api/quotations` - Create quotation
* `PUT /api/quotations/:id` - Update quotation status (`Draft`, `Sent`, `Accepted`, `Declined`)
* `POST /api/orders/from-quotation/:quotationId` - Convert accepted quotation directly into a Sales Order!

---

### 5. 🛒 Sales Orders, Stock & Delivery Modules
* **Sales Orders (`/api/orders`)**: Tracks active orders, payment statuses, and fulfillment.
* **Stocks Overview (`/api/stocks`)**: Live stock management for Sunmica sheets, Plywood, MDF boards, and Hardware items.
* **Deliveries & Dispatch (`/api/deliveries`)**: Tracks truck dispatch, driver details, and delivery completion.

---

## 🚀 Getting Started & Installation

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local MongoDB instance running at `mongodb://localhost:27017/furniture-erp` or MongoDB Atlas URI)

### 1. Backend Server Setup
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5000` and automatically seed initial sample data into MongoDB.

### 2. Frontend Client Setup
```bash
# In the root project folder
npm install
npm run dev
```
The frontend web app will open at `http://localhost:5173`.

---

## 📊 Dashboard & UI Layout

* **Sidebar Navigation**:
  * **CORE**: Dashboard, Notifications
  * **MODULES**:
    * **Inventory**: Stock Overview, Sunmica & Sheets, Plywood & MDF, Purchase Orders
    * **Sales & CRM**: Inquiries, Leads Management, Follow-ups Agenda, Customers Directory, Quotations, Sales Orders
    * **Logistics & Dispatch**: Dispatch, Delivery Tracking
    * **Finance**: Invoices & Payments, General Ledger
  * **SYSTEM**: Settings, User Profile & Dark/Light mode switcher.
