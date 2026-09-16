-- ============================================================
-- Supabase Postgres Trigger: auth.users → public.profiles
-- Run this ONCE in Supabase SQL Editor after running migrations.
-- This ensures every new signup automatically gets a profile row.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role, is_active, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.phone,
    'CUSTOMER',
    true,
    now(),
    now()
  )
  on conflict (id) do nothing; -- safety: don't fail if profile already exists
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists to allow re-running this script safely
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Verify trigger was created:
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
