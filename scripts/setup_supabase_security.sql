-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE "volunteerAvailability" ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para a tabela 'users'
-- Admins podem ver tudo
CREATE POLICY "Admins can manage all users" 
ON users FOR ALL 
USING ( (SELECT role FROM users WHERE id = auth.uid()::text) = 'admin' );

-- Usuários podem ver seu próprio registro
CREATE POLICY "Users can view own record" 
ON users FOR SELECT 
USING ( auth.uid()::text = id );

-- 3. Políticas para a tabela 'volunteers'
-- Admins podem gerenciar tudo
CREATE POLICY "Admins can manage all volunteers" 
ON volunteers FOR ALL 
USING ( (SELECT role FROM users WHERE id = auth.uid()::text) = 'admin' );

-- Voluntários podem ver seu próprio cadastro (baseado no email)
CREATE POLICY "Volunteers can view own data" 
ON volunteers FOR SELECT 
USING ( email = (SELECT email FROM users WHERE id = auth.uid()::text) );

-- 4. Políticas para 'volunteerAvailability'
-- Admins podem gerenciar tudo
CREATE POLICY "Admins can manage all availability" 
ON "volunteerAvailability" FOR ALL 
USING ( (SELECT role FROM users WHERE id = auth.uid()::text) = 'admin' );

-- 5. Trigger para sincronizar auth.users com public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se já existir e criar novamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
