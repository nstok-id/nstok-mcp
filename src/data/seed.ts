import { RepositoryMetadata } from '../domain/repository.js';
import { Feature } from '../domain/feature.js';
import { UIComponent } from '../domain/component.js';
import { DBEntity } from '../domain/database.js';
import { GraphNode, GraphEdge } from '../domain/graph.js';

export const SEED_REPOSITORIES: RepositoryMetadata[] = [
  {
    id: 'repo-db',
    name: 'Nstok-db',
    type: 'db',
    version: '1.4.0',
    status: 'stable',
    description: 'Central database schema, migrations, Drizzle ORM models, and seed data for NSTOK ecosystem.',
    stack: ['typescript', 'postgresql', 'drizzle-orm', 'pgvector'],
    dependencies: [],
    provides: ['database-schema', 'db-migrations', 'db-entities', 'db-seed']
  },
  {
    id: 'repo-ui',
    name: 'Nstok-ui',
    type: 'ui',
    version: '2.1.0',
    status: 'stable',
    description: 'Shared design system, React/React Native UI components, tokens, and theme provider for NSTOK.',
    stack: ['typescript', 'react', 'react-native', 'tailwind-variants'],
    dependencies: [],
    provides: ['ui-components', 'theme-provider', 'design-tokens', 'icons']
  },
  {
    id: 'repo-feature-a',
    name: 'Nstok-feature-a',
    type: 'feature',
    version: '1.2.0',
    status: 'stable',
    description: 'Authentication, user session management, RBAC, and login/register flows.',
    stack: ['typescript', 'react-native', 'expo', 'jwt'],
    dependencies: ['Nstok-ui', 'Nstok-db'],
    provides: ['authentication', 'authorization', 'user-session', 'role-guard']
  },
  {
    id: 'repo-feature-b',
    name: 'Nstok-feature-b',
    type: 'feature',
    version: '1.3.1',
    status: 'stable',
    description: 'Product catalog, categories, pricing, barcode lookup, and product management.',
    stack: ['typescript', 'react-native', 'expo'],
    dependencies: ['Nstok-ui', 'Nstok-db', 'Nstok-feature-a'],
    provides: ['product-management', 'category-management', 'barcode-scanner', 'product-pricing']
  },
  {
    id: 'repo-feature-c',
    name: 'Nstok-feature-c',
    type: 'feature',
    version: '1.5.0',
    status: 'stable',
    description: 'Inventory control, warehouse management, stock-in, stock-out, adjustment, and movement history.',
    stack: ['typescript', 'react-native', 'expo'],
    dependencies: ['Nstok-ui', 'Nstok-db', 'Nstok-feature-b'],
    provides: ['inventory-management', 'stock-in', 'stock-out', 'stock-adjustment', 'stock-history']
  },
  {
    id: 'repo-feature-template',
    name: 'Nstok-feature-template',
    type: 'template',
    version: '1.0.0',
    status: 'stable',
    description: 'Standard baseline boilerplate and architecture scaffolding for building new NSTOK business features.',
    stack: ['typescript', 'react-native', 'expo', 'vitest'],
    dependencies: ['Nstok-ui', 'Nstok-db'],
    provides: ['feature-scaffolding', 'feature-contract', 'standard-feature-structure']
  },
  {
    id: 'repo-app-template',
    name: 'Nstok-app-template',
    type: 'template',
    version: '1.0.0',
    status: 'stable',
    description: 'Baseline production-ready application template for generating new NSTOK web/mobile apps.',
    stack: ['typescript', 'react-native', 'expo', 'drizzle-orm', 'expo-router'],
    dependencies: ['Nstok-ui', 'Nstok-db'],
    provides: ['app-scaffolding', 'navigation-base', 'root-providers', 'app-config']
  },
  {
    id: 'repo-app-q',
    name: 'Nstok-app-q',
    type: 'app',
    version: '2.0.0',
    status: 'stable',
    description: 'Flagship Point-of-Sale (POS) mobile & tablet application for retail and restaurant operations.',
    stack: ['typescript', 'react-native', 'expo', 'expo-router'],
    dependencies: ['Nstok-ui', 'Nstok-db', 'Nstok-feature-a', 'Nstok-feature-b', 'Nstok-feature-c'],
    provides: ['retail-pos-app', 'cashier-workflow']
  },
  {
    id: 'repo-knowledge-master',
    name: 'Nstok-knowledge-master',
    type: 'knowledge',
    version: '1.0.0',
    status: 'stable',
    description: 'Central engineering knowledge repository, RAG vector index, and ecosystem graph metadata.',
    stack: ['typescript', 'nodejs', 'mcp-sdk'],
    dependencies: [],
    provides: ['central-knowledge', 'graph-engine', 'rag-search', 'software-factory-meta']
  }
];

export const SEED_FEATURES: Feature[] = [
  {
    id: 'auth-management',
    name: 'Authentication & Session Management',
    repository: 'Nstok-feature-a',
    status: 'stable',
    version: '1.2.0',
    description: 'User login, logout, JWT token refresh, biometric auth, and role-based permissions.',
    capabilities: ['authentication', 'auth', 'login', 'jwt', 'rbac', 'user-session'],
    dependencies: [],
    uiComponents: ['Button', 'SearchInput', 'LoadingState', 'Modal'],
    dbEntities: ['User', 'Role', 'AuditLog'],
    routes: ['/login', '/profile', '/roles'],
    apis: ['POST /auth/login', 'POST /auth/refresh', 'GET /auth/me']
  },
  {
    id: 'product-management',
    name: 'Product Catalog & Pricing',
    repository: 'Nstok-feature-b',
    status: 'stable',
    version: '1.3.1',
    description: 'Product listing, barcode scanning, category hierarchy, SKU management, and unit pricing.',
    capabilities: ['product-management', 'products', 'catalog', 'category-management', 'barcode-scanner'],
    dependencies: ['auth-management'],
    uiComponents: ['ProductTable', 'SearchInput', 'DataTable', 'FilterSheet', 'Badge'],
    dbEntities: ['Product', 'Category'],
    routes: ['/products', '/products/new', '/products/:id', '/categories'],
    apis: ['GET /products', 'POST /products', 'PUT /products/:id', 'GET /categories']
  },
  {
    id: 'inventory-management',
    name: 'Inventory & Stock Management',
    repository: 'Nstok-feature-c',
    status: 'stable',
    version: '1.5.0',
    description: 'Real-time stock tracking, stock adjustments, low stock alerts, warehouse transfers, and batch tracking.',
    capabilities: ['inventory', 'stock-in', 'stock-out', 'stock-adjustment', 'stock-history', 'warehouse', 'low-stock-alert'],
    dependencies: ['product-management'],
    uiComponents: ['DataTable', 'SearchInput', 'FilterSheet', 'Badge', 'EmptyState'],
    dbEntities: ['Product', 'Inventory', 'StockMovement', 'Warehouse'],
    routes: ['/inventory', '/inventory/adjust', '/inventory/history'],
    apis: ['GET /inventory', 'POST /inventory/adjust', 'GET /inventory/movements']
  },
  {
    id: 'checkout-payment',
    name: 'Checkout & Payment Processing',
    repository: 'Nstok-app-q', // Reusable submodule in App Q
    status: 'stable',
    version: '1.1.0',
    description: 'Shopping cart, discount application, multi-payment methods (Cash, QRIS, Card), and receipt generation.',
    capabilities: ['checkout', 'payment', 'cart', 'order-processing', 'qris', 'receipt'],
    dependencies: ['product-management', 'inventory-management'],
    uiComponents: ['DataTable', 'Button', 'Modal', 'Card', 'Badge'],
    dbEntities: ['Sale', 'SaleItem', 'Payment', 'Product', 'Inventory'],
    routes: ['/checkout', '/payment/success'],
    apis: ['POST /sales/checkout', 'POST /payments/process', 'GET /sales/:id/receipt']
  }
];

export const SEED_UI_COMPONENTS: UIComponent[] = [
  {
    id: 'ui-datatable',
    name: 'DataTable',
    repository: 'Nstok-ui',
    category: 'data-display',
    description: 'Responsive, paginated data table with column sorting, filtering, and selection support.',
    props: [
      { name: 'data', type: 'T[]', required: true, description: 'Array of data records' },
      { name: 'columns', type: 'ColumnDef<T>[]', required: true, description: 'Column configuration' },
      { name: 'onRowClick', type: '(row: T) => void', required: false, description: 'Row click callback' },
      { name: 'isLoading', type: 'boolean', required: false, defaultValue: 'false', description: 'Loading indicator state' }
    ],
    dependencies: ['Nstok-ui/theme'],
    usedBy: ['Nstok-feature-b', 'Nstok-feature-c', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/DataTable.tsx',
    exportName: 'DataTable'
  },
  {
    id: 'ui-producttable',
    name: 'ProductTable',
    repository: 'Nstok-ui',
    category: 'data-display',
    description: 'Specialized table for product items with image preview, stock status badge, and quick price edit.',
    props: [
      { name: 'products', type: 'ProductItem[]', required: true, description: 'List of products' },
      { name: 'onSelect', type: '(product: ProductItem) => void', required: false, description: 'Selection handler' },
      { name: 'showStock', type: 'boolean', required: false, defaultValue: 'true', description: 'Toggle stock badge' }
    ],
    dependencies: ['Nstok-ui/DataTable', 'Nstok-ui/Badge'],
    usedBy: ['Nstok-feature-b', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/ProductTable.tsx',
    exportName: 'ProductTable'
  },
  {
    id: 'ui-searchinput',
    name: 'SearchInput',
    repository: 'Nstok-ui',
    category: 'form',
    description: 'Debounced search input with clear button, shortcut hint, and loading spinner.',
    props: [
      { name: 'value', type: 'string', required: true, description: 'Search term query' },
      { name: 'onChange', type: '(val: string) => void', required: true, description: 'Input change handler' },
      { name: 'placeholder', type: 'string', required: false, defaultValue: '"Search..."', description: 'Placeholder text' },
      { name: 'debounceMs', type: 'number', required: false, defaultValue: '300', description: 'Debounce delay in ms' }
    ],
    dependencies: ['Nstok-ui/theme'],
    usedBy: ['Nstok-feature-a', 'Nstok-feature-b', 'Nstok-feature-c', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/SearchInput.tsx',
    exportName: 'SearchInput'
  },
  {
    id: 'ui-filtersheet',
    name: 'FilterSheet',
    repository: 'Nstok-ui',
    category: 'overlay',
    description: 'Slide-over filter bottom sheet for mobile/responsive filtering with reset & apply buttons.',
    props: [
      { name: 'isOpen', type: 'boolean', required: true, description: 'Sheet open state' },
      { name: 'onClose', type: '() => void', required: true, description: 'Close callback' },
      { name: 'onApply', type: '(filters: Record<string, any>) => void', required: true, description: 'Apply filters callback' }
    ],
    dependencies: ['Nstok-ui/Button', 'Nstok-ui/theme'],
    usedBy: ['Nstok-feature-b', 'Nstok-feature-c'],
    sourcePath: 'packages/ui/src/components/FilterSheet.tsx',
    exportName: 'FilterSheet'
  },
  {
    id: 'ui-button',
    name: 'Button',
    repository: 'Nstok-ui',
    category: 'form',
    description: 'Universal button component supporting primary, secondary, outline, ghost, and danger variants.',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'", required: false, defaultValue: "'primary'", description: 'Button styling variant' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, defaultValue: "'md'", description: 'Size variant' },
      { name: 'isLoading', type: 'boolean', required: false, defaultValue: 'false', description: 'Loading state' }
    ],
    dependencies: ['Nstok-ui/theme'],
    usedBy: ['Nstok-feature-a', 'Nstok-feature-b', 'Nstok-feature-c', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/Button.tsx',
    exportName: 'Button'
  },
  {
    id: 'ui-card',
    name: 'Card',
    repository: 'Nstok-ui',
    category: 'layout',
    description: 'Elevated container card with optional header, footer, and interactive hover states.',
    props: [
      { name: 'title', type: 'string', required: false, description: 'Card title' },
      { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", required: false, defaultValue: "'md'", description: 'Inner padding' }
    ],
    dependencies: ['Nstok-ui/theme'],
    usedBy: ['Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/Card.tsx',
    exportName: 'Card'
  },
  {
    id: 'ui-badge',
    name: 'Badge',
    repository: 'Nstok-ui',
    category: 'data-display',
    description: 'Status badge component (success, warning, error, info, neutral).',
    props: [
      { name: 'variant', type: "'success' | 'warning' | 'error' | 'info' | 'neutral'", required: false, defaultValue: "'neutral'", description: 'Status color variant' },
      { name: 'label', type: 'string', required: true, description: 'Badge text' }
    ],
    dependencies: ['Nstok-ui/theme'],
    usedBy: ['Nstok-feature-b', 'Nstok-feature-c', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/Badge.tsx',
    exportName: 'Badge'
  },
  {
    id: 'ui-emptystate',
    name: 'EmptyState',
    repository: 'Nstok-ui',
    category: 'feedback',
    description: 'Illustrative empty state screen/card with title, subtitle, and primary call-to-action button.',
    props: [
      { name: 'title', type: 'string', required: true, description: 'Empty state headline' },
      { name: 'description', type: 'string', required: false, description: 'Guidance message' },
      { name: 'actionLabel', type: 'string', required: false, description: 'Action button text' },
      { name: 'onAction', type: '() => void', required: false, description: 'Action button handler' }
    ],
    dependencies: ['Nstok-ui/Button'],
    usedBy: ['Nstok-feature-c', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/EmptyState.tsx',
    exportName: 'EmptyState'
  },
  {
    id: 'ui-loadingstate',
    name: 'LoadingState',
    repository: 'Nstok-ui',
    category: 'feedback',
    description: 'Skeleton and spinner loading state wrapper.',
    props: [
      { name: 'type', type: "'spinner' | 'skeleton'", required: false, defaultValue: "'spinner'", description: 'Loading variant' },
      { name: 'message', type: 'string', required: false, description: 'Optional text below spinner' }
    ],
    dependencies: ['Nstok-ui/theme'],
    usedBy: ['Nstok-feature-a', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/LoadingState.tsx',
    exportName: 'LoadingState'
  },
  {
    id: 'ui-modal',
    name: 'Modal',
    repository: 'Nstok-ui',
    category: 'overlay',
    description: 'Accessible modal dialog with header, body, footer, and backdrop blur.',
    props: [
      { name: 'isOpen', type: 'boolean', required: true, description: 'Modal visibility state' },
      { name: 'title', type: 'string', required: true, description: 'Modal header title' },
      { name: 'onClose', type: '() => void', required: true, description: 'Close handler' }
    ],
    dependencies: ['Nstok-ui/Button', 'Nstok-ui/theme'],
    usedBy: ['Nstok-feature-a', 'Nstok-app-q'],
    sourcePath: 'packages/ui/src/components/Modal.tsx',
    exportName: 'Modal'
  }
];

export const SEED_DB_ENTITIES: DBEntity[] = [
  {
    id: 'db-user',
    name: 'User',
    repository: 'Nstok-db',
    tableName: 'users',
    description: 'User accounts, hashed passwords, role links, and status.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Unique user identifier' },
      { name: 'email', type: 'varchar(255)', isNullable: false, description: 'Unique email address' },
      { name: 'name', type: 'varchar(100)', isNullable: false, description: 'Full user name' },
      { name: 'roleId', type: 'uuid', isNullable: false, description: 'FK to roles.id' },
      { name: 'status', type: 'varchar(20)', defaultValue: "'active'", description: 'Account status' },
      { name: 'createdAt', type: 'timestamp', defaultValue: 'now()' }
    ],
    relations: [
      { name: 'role', type: 'many-to-one', targetEntity: 'Role', foreignKey: 'roleId' }
    ],
    indexes: ['idx_users_email'],
    sourcePath: 'packages/db/src/schema/users.ts'
  },
  {
    id: 'db-role',
    name: 'Role',
    repository: 'Nstok-db',
    tableName: 'roles',
    description: 'User roles and permission definitions (Admin, Manager, Cashier, Staff).',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Role identifier' },
      { name: 'name', type: 'varchar(50)', isNullable: false, description: 'Role name' },
      { name: 'permissions', type: 'jsonb', defaultValue: "'[]'", description: 'Permission string keys' }
    ],
    relations: [
      { name: 'users', type: 'one-to-many', targetEntity: 'User', foreignKey: 'roleId' }
    ],
    sourcePath: 'packages/db/src/schema/roles.ts'
  },
  {
    id: 'db-product',
    name: 'Product',
    repository: 'Nstok-db',
    tableName: 'products',
    description: 'Product master data with SKU, barcode, unit, and prices.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Product ID' },
      { name: 'sku', type: 'varchar(50)', isNullable: false, description: 'Stock Keeping Unit' },
      { name: 'barcode', type: 'varchar(100)', isNullable: true, description: 'EAN/UPC barcode' },
      { name: 'name', type: 'varchar(200)', isNullable: false, description: 'Product title' },
      { name: 'categoryId', type: 'uuid', isNullable: true, description: 'FK to categories.id' },
      { name: 'price', type: 'numeric(12,2)', isNullable: false, description: 'Retail unit price' },
      { name: 'costPrice', type: 'numeric(12,2)', isNullable: false, description: 'Cost of goods sold' },
      { name: 'createdAt', type: 'timestamp', defaultValue: 'now()' }
    ],
    relations: [
      { name: 'category', type: 'many-to-one', targetEntity: 'Category', foreignKey: 'categoryId' },
      { name: 'inventory', type: 'one-to-many', targetEntity: 'Inventory', foreignKey: 'productId' }
    ],
    indexes: ['idx_products_sku', 'idx_products_barcode'],
    sourcePath: 'packages/db/src/schema/products.ts'
  },
  {
    id: 'db-category',
    name: 'Category',
    repository: 'Nstok-db',
    tableName: 'categories',
    description: 'Hierarchical product category taxonomy.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Category ID' },
      { name: 'name', type: 'varchar(100)', isNullable: false, description: 'Category name' },
      { name: 'parentId', type: 'uuid', isNullable: true, description: 'Parent category ID' }
    ],
    relations: [
      { name: 'products', type: 'one-to-many', targetEntity: 'Product', foreignKey: 'categoryId' }
    ],
    sourcePath: 'packages/db/src/schema/categories.ts'
  },
  {
    id: 'db-inventory',
    name: 'Inventory',
    repository: 'Nstok-db',
    tableName: 'inventories',
    description: 'Per-warehouse stock balances, reserved stock, and reorder levels.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Inventory record ID' },
      { name: 'productId', type: 'uuid', isNullable: false, description: 'FK to products.id' },
      { name: 'warehouseId', type: 'uuid', isNullable: false, description: 'FK to warehouses.id' },
      { name: 'quantity', type: 'integer', isNullable: false, defaultValue: '0', description: 'Available physical quantity' },
      { name: 'reservedQuantity', type: 'integer', isNullable: false, defaultValue: '0', description: 'Allocated/cart quantity' },
      { name: 'minThreshold', type: 'integer', isNullable: false, defaultValue: '10', description: 'Low stock alert threshold' }
    ],
    relations: [
      { name: 'product', type: 'many-to-one', targetEntity: 'Product', foreignKey: 'productId' },
      { name: 'warehouse', type: 'many-to-one', targetEntity: 'Warehouse', foreignKey: 'warehouseId' }
    ],
    indexes: ['idx_inventory_product_warehouse'],
    sourcePath: 'packages/db/src/schema/inventory.ts'
  },
  {
    id: 'db-stockmovement',
    name: 'StockMovement',
    repository: 'Nstok-db',
    tableName: 'stock_movements',
    description: 'Immutable ledger for inventory in, out, adjustment, transfer, and sales deductions.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Movement ID' },
      { name: 'productId', type: 'uuid', isNullable: false, description: 'FK to products.id' },
      { name: 'warehouseId', type: 'uuid', isNullable: false, description: 'FK to warehouses.id' },
      { name: 'type', type: 'varchar(30)', isNullable: false, description: 'IN | OUT | ADJUST | TRANSFER | SALE' },
      { name: 'delta', type: 'integer', isNullable: false, description: 'Signed quantity change' },
      { name: 'reason', type: 'varchar(255)', isNullable: true, description: 'Adjustment justification' },
      { name: 'referenceId', type: 'varchar(100)', isNullable: true, description: 'Order/PO reference' },
      { name: 'createdAt', type: 'timestamp', defaultValue: 'now()' }
    ],
    relations: [
      { name: 'product', type: 'many-to-one', targetEntity: 'Product', foreignKey: 'productId' }
    ],
    sourcePath: 'packages/db/src/schema/stock_movements.ts'
  },
  {
    id: 'db-warehouse',
    name: 'Warehouse',
    repository: 'Nstok-db',
    tableName: 'warehouses',
    description: 'Store locations, central distribution hubs, and storage facilities.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Warehouse ID' },
      { name: 'name', type: 'varchar(100)', isNullable: false, description: 'Location name' },
      { name: 'code', type: 'varchar(20)', isNullable: false, description: 'Short warehouse code' },
      { name: 'address', type: 'text', isNullable: true, description: 'Physical address' }
    ],
    relations: [
      { name: 'inventories', type: 'one-to-many', targetEntity: 'Inventory', foreignKey: 'warehouseId' }
    ],
    sourcePath: 'packages/db/src/schema/warehouses.ts'
  },
  {
    id: 'db-sale',
    name: 'Sale',
    repository: 'Nstok-db',
    tableName: 'sales',
    description: 'Completed customer sales transactions and orders.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Sale invoice ID' },
      { name: 'invoiceNumber', type: 'varchar(50)', isNullable: false, description: 'Unique invoice sequence' },
      { name: 'totalAmount', type: 'numeric(12,2)', isNullable: false, description: 'Grand total bill' },
      { name: 'discountAmount', type: 'numeric(12,2)', defaultValue: '0.00' },
      { name: 'taxAmount', type: 'numeric(12,2)', defaultValue: '0.00' },
      { name: 'status', type: 'varchar(20)', defaultValue: "'completed'" },
      { name: 'cashierId', type: 'uuid', isNullable: false, description: 'User ID of cashier' },
      { name: 'createdAt', type: 'timestamp', defaultValue: 'now()' }
    ],
    relations: [
      { name: 'items', type: 'one-to-many', targetEntity: 'SaleItem', foreignKey: 'saleId' },
      { name: 'payments', type: 'one-to-many', targetEntity: 'Payment', foreignKey: 'saleId' }
    ],
    sourcePath: 'packages/db/src/schema/sales.ts'
  },
  {
    id: 'db-saleitem',
    name: 'SaleItem',
    repository: 'Nstok-db',
    tableName: 'sale_items',
    description: 'Itemized lines within a sales order.',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Line item ID' },
      { name: 'saleId', type: 'uuid', isNullable: false, description: 'FK to sales.id' },
      { name: 'productId', type: 'uuid', isNullable: false, description: 'FK to products.id' },
      { name: 'quantity', type: 'integer', isNullable: false, description: 'Purchased quantity' },
      { name: 'unitPrice', type: 'numeric(12,2)', isNullable: false, description: 'Price at purchase time' },
      { name: 'subtotal', type: 'numeric(12,2)', isNullable: false }
    ],
    relations: [
      { name: 'sale', type: 'many-to-one', targetEntity: 'Sale', foreignKey: 'saleId' },
      { name: 'product', type: 'many-to-one', targetEntity: 'Product', foreignKey: 'productId' }
    ],
    sourcePath: 'packages/db/src/schema/sale_items.ts'
  },
  {
    id: 'db-payment',
    name: 'Payment',
    repository: 'Nstok-db',
    tableName: 'payments',
    description: 'Payment transactions for sales (Cash, QRIS, Card, Bank Transfer).',
    fields: [
      { name: 'id', type: 'uuid', isPrimary: true, description: 'Payment ID' },
      { name: 'saleId', type: 'uuid', isNullable: false, description: 'FK to sales.id' },
      { name: 'method', type: 'varchar(30)', isNullable: false, description: 'CASH | QRIS | CARD | TRANSFER' },
      { name: 'amount', type: 'numeric(12,2)', isNullable: false, description: 'Paid amount' },
      { name: 'referenceCode', type: 'varchar(100)', isNullable: true, description: 'Gateway transaction reference' },
      { name: 'status', type: 'varchar(20)', defaultValue: "'settled'" },
      { name: 'createdAt', type: 'timestamp', defaultValue: 'now()' }
    ],
    relations: [
      { name: 'sale', type: 'many-to-one', targetEntity: 'Sale', foreignKey: 'saleId' }
    ],
    sourcePath: 'packages/db/src/schema/payments.ts'
  }
];

export const SEED_PATTERNS = [
  {
    id: 'pattern-reuse-first',
    name: 'Reuse First Principle',
    category: 'architecture',
    description: 'Always search existing features, UI components, and DB entities before creating new ones. Search -> Reuse -> Adapt -> Create.',
    codeSample: '// Bad: Creating a new Button component in an app\n// Good: import { Button } from "@nstok/ui";'
  },
  {
    id: 'pattern-template-first',
    name: 'Template First Scaffolding',
    category: 'scaffolding',
    description: 'Apps must be generated from Nstok-app-template and features must be scaffolded from Nstok-feature-template.',
    codeSample: 'create_app({ template: "Nstok-app-template", name: "nstok-app-w" })'
  },
  {
    id: 'pattern-drizzle-repository',
    name: 'Drizzle Schema & Repository Pattern',
    category: 'database',
    description: 'All entity interactions must use Nstok-db schemas and repository services to avoid schema drift.',
    codeSample: 'import { products, inventories } from "@nstok/db/schema";'
  },
  {
    id: 'pattern-git-pr-workflow',
    name: 'Git Feature Branch & PR Workflow',
    category: 'git',
    description: 'Never commit directly to main. Always create branch `feature/ai/<name>`, validate, commit, and create PR for human review.',
    codeSample: 'create_branch("feature/ai/create-nstok-app-w") -> run_tests() -> create_commit() -> create_pull_request()'
  }
];

export function generateSeedGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // 1. Add Repositories
  for (const repo of SEED_REPOSITORIES) {
    nodes.push({
      id: repo.name,
      label: repo.name,
      type: 'repository',
      description: repo.description,
      repository: repo.name,
      metadata: { ...repo }
    });
  }

  // 2. Add UI Components
  for (const ui of SEED_UI_COMPONENTS) {
    nodes.push({
      id: ui.name,
      label: ui.name,
      type: 'ui_component',
      description: ui.description,
      repository: ui.repository,
      metadata: { ...ui }
    });

    edges.push({
      id: `${ui.name}-BELONGS_TO-${ui.repository}`,
      source: ui.name,
      target: ui.repository,
      relationship: 'BELONGS_TO'
    });
  }

  // 3. Add DB Entities
  for (const db of SEED_DB_ENTITIES) {
    nodes.push({
      id: db.name,
      label: db.name,
      type: 'db_entity',
      description: db.description,
      repository: db.repository,
      metadata: { ...db }
    });

    edges.push({
      id: `${db.name}-BELONGS_TO-${db.repository}`,
      source: db.name,
      target: db.repository,
      relationship: 'BELONGS_TO'
    });
  }

  // 4. Add Features
  for (const feat of SEED_FEATURES) {
    nodes.push({
      id: feat.id,
      label: feat.name,
      type: 'feature',
      description: feat.description,
      repository: feat.repository,
      metadata: { ...feat }
    });

    edges.push({
      id: `${feat.id}-IMPLEMENTED_IN-${feat.repository}`,
      source: feat.id,
      target: feat.repository,
      relationship: 'IMPLEMENTED_IN'
    });

    // Feature uses UI components
    for (const comp of feat.uiComponents) {
      edges.push({
        id: `${feat.id}-USES-UI-${comp}`,
        source: feat.id,
        target: comp,
        relationship: 'USES'
      });
    }

    // Feature uses DB entities
    for (const entity of feat.dbEntities) {
      edges.push({
        id: `${feat.id}-USES-DB-${entity}`,
        source: feat.id,
        target: entity,
        relationship: 'USES'
      });
    }

    // Feature depends on other features
    for (const dep of feat.dependencies) {
      edges.push({
        id: `${feat.id}-DEPENDS_ON-${dep}`,
        source: feat.id,
        target: dep,
        relationship: 'DEPENDS_ON'
      });
    }
  }

  // 5. Add App Q (Production app node)
  nodes.push({
    id: 'Nstok-app-q',
    label: 'Nstok-app-q',
    type: 'application',
    description: 'Flagship Point-of-Sale (POS) application.',
    repository: 'Nstok-app-q',
    metadata: {
      template: 'Nstok-app-template',
      reusedFeatures: ['auth-management', 'product-management', 'inventory-management', 'checkout-payment']
    }
  });

  edges.push({
    id: 'Nstok-app-q-BASED_ON-Nstok-app-template',
    source: 'Nstok-app-q',
    target: 'Nstok-app-template',
    relationship: 'BASED_ON'
  });

  edges.push({
    id: 'Nstok-app-q-USES-auth-management',
    source: 'Nstok-app-q',
    target: 'auth-management',
    relationship: 'USES'
  });

  edges.push({
    id: 'Nstok-app-q-USES-product-management',
    source: 'Nstok-app-q',
    target: 'product-management',
    relationship: 'USES'
  });

  edges.push({
    id: 'Nstok-app-q-USES-inventory-management',
    source: 'Nstok-app-q',
    target: 'inventory-management',
    relationship: 'USES'
  });

  return { nodes, edges };
}
