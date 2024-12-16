-- Drop existing customers table
DROP TABLE IF EXISTS customers CASCADE;

-- Recreate customers table with correct schema
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  country TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  last_order_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Recreate indexes
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view customers from their stores"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = customers.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage customers from their stores"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = customers.store_id
      AND stores.user_id = auth.uid()
    )
  );