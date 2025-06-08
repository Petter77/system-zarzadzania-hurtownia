<<<<<<< HEAD

=======
>>>>>>> 9bedf9316420435ae0d19759be3edebef91cdac0
import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

// Model: Users
export const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: DataTypes.STRING,
  password_hash: DataTypes.STRING,
  role: DataTypes.ENUM('user', 'manager', 'auditor'),
}, { timestamps: false });

// Model: Item Instances
export const ItemInstance = sequelize.define('item_instances', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  item_id: DataTypes.INTEGER,
  serial_number: DataTypes.STRING,
  status: DataTypes.ENUM('available', 'borrowed', 'damaged', 'archived'),
  location: DataTypes.STRING,
}, { timestamps: false });

// Model: In-Out Operations
export const InOutOperation = sequelize.define('in_out_operations', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  instance_id: DataTypes.INTEGER,
  type: DataTypes.ENUM('in', 'out', 'borrow', 'return'),
  performed_by: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
  timestamp: DataTypes.DATE,
  remarks: DataTypes.TEXT,
}, { timestamps: false });

// Model: Audit In-Out Operations
export const AuditInOutOperation = sequelize.define('audit_in_out_operations', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  operation_id: DataTypes.INTEGER,
  changed_by: DataTypes.INTEGER,
  operation_type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE'),
  old_data: DataTypes.TEXT,
  new_data: DataTypes.TEXT,
  timestamp: DataTypes.DATE,
}, { timestamps: false });

// Model: Inventory Items
export const InventoryItem = sequelize.define('inventory_items', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  manufacturer: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false }, // Kod sprzętu
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // Ilość sprzętu
  location: { type: DataTypes.STRING }, // Lokalizacja
  description: { type: DataTypes.TEXT }, // Opis sprzętu
}, { timestamps: false });

// Model: Invoices
export const Invoice = sequelize.define('invoices', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  number: DataTypes.STRING,
  issued_by: DataTypes.INTEGER,
  issued_at: DataTypes.DATE,
}, { timestamps: false });

// Model: Invoice Items
export const InvoiceItem = sequelize.define('invoice_items', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoice_id: DataTypes.INTEGER,
  instance_id: DataTypes.INTEGER,
  description: DataTypes.TEXT,
  price: DataTypes.DECIMAL(10, 2),
}, { timestamps: false });

// Model: Reports
export const Report = sequelize.define('reports', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  created_by: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
}, { timestamps: false });

// Model: Report Items
export const ReportItem = sequelize.define('report_items', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  report_id: DataTypes.INTEGER,
  instance_id: DataTypes.INTEGER,
  remarks: DataTypes.TEXT,
<<<<<<< HEAD
}, { timestamps: false });
=======
}, { timestamps: false });
>>>>>>> 9bedf9316420435ae0d19759be3edebef91cdac0
