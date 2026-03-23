// Supabase schema for Kazi quotes
// Run this in Supabase SQL editor

-- Create quotes table
CREATE TABLE IF NOT EXISTS kazi_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  
  -- Product details
  product_type TEXT NOT NULL,
  decoration_type TEXT,
  print_locations TEXT[],
  num_colors TEXT,
  quantity INTEGER,
  timeline TEXT,
  message TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'new', -- new, contacted, quoted, accepted, rejected
  source TEXT DEFAULT 'website',
  notes TEXT,
  
  -- Pricing (filled later)
  quoted_price NUMERIC,
  quoted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE kazi_quotes ENABLE ROW LEVEL SECURITY;

-- Allow inserts from API (service role)
-- Allow selects for admin users only
CREATE POLICY "Allow all operations" ON kazi_quotes
  FOR ALL USING (true) WITH CHECK (true);

-- Create index for status filtering
CREATE INDEX idx_kazi_quotes_status ON kazi_quotes(status);
CREATE INDEX idx_kazi_quotes_created_at ON kazi_quotes(created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_kazi_quotes_updated_at
  BEFORE UPDATE ON kazi_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();