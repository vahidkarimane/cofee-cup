-- Create fortunes table
CREATE TABLE IF NOT EXISTS fortunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  image_url TEXT[] DEFAULT '{}',
  prediction TEXT DEFAULT '',
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  intent TEXT NOT NULL,
  about TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  payment_id UUID
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_payment_intent_id TEXT NOT NULL,
  fortune_id UUID NOT NULL REFERENCES fortunes(id)
);

-- Add index for user_id on fortunes
CREATE INDEX IF NOT EXISTS idx_fortunes_user_id ON fortunes(user_id);

-- Add index for user_id on payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Add index for fortune_id on payments
CREATE INDEX IF NOT EXISTS idx_payments_fortune_id ON payments(fortune_id);

-- Enable Row Level Security
ALTER TABLE fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for fortunes table
CREATE POLICY "Users can view their own fortunes" 
  ON fortunes FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own fortunes" 
  ON fortunes FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own fortunes" 
  ON fortunes FOR UPDATE 
  USING (user_id = auth.uid());

-- Create policies for payments table
CREATE POLICY "Users can view their own payments" 
  ON payments FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payments" 
  ON payments FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payments" 
  ON payments FOR UPDATE 
  USING (user_id = auth.uid());
