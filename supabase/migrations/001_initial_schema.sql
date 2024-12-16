-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT,
  api_key TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create customers table
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
  last_order_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_number TEXT,
  total_amount DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create loyalty_cards table
CREATE TABLE loyalty_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  stamps INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Stores policies
CREATE POLICY "Users can view their own stores"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stores"
  ON stores FOR ALL
  USING (auth.uid() = user_id);

-- Customers policies
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

-- Orders policies
CREATE POLICY "Users can view orders from their stores"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage orders from their stores"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Loyalty cards policies
CREATE POLICY "Users can view loyalty cards from their stores"
  ON loyalty_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = loyalty_cards.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage loyalty cards from their stores"
  ON loyalty_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = loyalty_cards.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_loyalty_cards_customer_id ON loyalty_cards(customer_id);
CREATE INDEX idx_loyalty_cards_store_id ON loyalty_cards(store_id);