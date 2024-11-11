-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  group_name text default 'Uncategorized',
  date date not null default current_date,
  completed boolean default false,
  completed_at timestamptz,
  featured boolean default false,
  created_at timestamptz default now(),
  "order" integer
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table tasks enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can view own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Create indexes
create index tasks_user_id_idx on tasks(user_id);
create index tasks_featured_idx on tasks(user_id, featured);
create index tasks_date_idx on tasks(user_id, date);

-- Function to handle new user creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();