-- Egytronic POS Cloud: multi-tenant schema with Row Level Security.
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vat_rate numeric(5,2) not null default 14 check (vat_rate between 0 and 100),
  created_at timestamptz not null default now()
);
create table members (
  org_id uuid not null references orgs on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'cashier' check (role in ('owner','manager','cashier')),
  primary key (org_id, user_id)
);
create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  name_en text not null,
  name_ar text not null,
  category text not null default 'general',
  price numeric(12,2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true
);
create index on products (org_id);
create table orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  number bigint generated always as identity,
  cashier uuid default auth.uid(),
  type text not null check (type in ('dine','take','del')),
  method text not null check (method in ('cash','card','wallet')),
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null,
  tax numeric(12,2) not null,
  total numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index on orders (org_id, created_at desc);
create table order_items (
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  qty int not null check (qty > 0),
  unit_price numeric(12,2) not null,
  primary key (order_id, product_id)
);

create function is_member(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from members where org_id = o and user_id = auth.uid()) $$;
create function is_manager(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from members where org_id = o and user_id = auth.uid() and role in ('owner','manager')) $$;

alter table orgs enable row level security;
alter table members enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy orgs_sel on orgs for select using (is_member(id));
create policy orgs_upd on orgs for update using (is_manager(id)) with check (is_manager(id));
create policy members_sel on members for select using (user_id = auth.uid() or is_manager(org_id));
create policy products_sel on products for select using (is_member(org_id));
create policy products_ins on products for insert with check (is_manager(org_id));
create policy products_upd on products for update using (is_manager(org_id)) with check (is_manager(org_id));
create policy products_del on products for delete using (is_manager(org_id));
create policy orders_sel on orders for select using (is_member(org_id));
create policy items_sel on order_items for select using (exists (select 1 from orders o where o.id = order_id and is_member(o.org_id)));

create function create_org(p_name text) returns uuid language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into orgs (name) values (left(trim(p_name), 120)) returning id into v;
  insert into members (org_id, user_id, role) values (v, auth.uid(), 'owner');
  return v;
end $$;

-- Atomic checkout: validates stock, computes totals server-side, writes order + items, decrements stock.
create function checkout(p_org uuid, p_type text, p_method text, p_discount_pct numeric, p_items jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order uuid; v_rate numeric; v_sub numeric := 0; v_disc numeric; v_tax numeric;
  it jsonb; pr products%rowtype; v_qty int;
begin
  if not is_member(p_org) then raise exception 'forbidden'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'empty order'; end if;
  select vat_rate into v_rate from orgs where id = p_org;
  for it in select value from jsonb_array_elements(p_items) loop
    v_qty := (it->>'qty')::int;
    select * into pr from products where id = (it->>'id')::uuid and org_id = p_org and active for update;
    if not found then raise exception 'unknown product'; end if;
    if v_qty < 1 or pr.stock < v_qty then raise exception 'insufficient stock for %', pr.name_en; end if;
    v_sub := v_sub + pr.price * v_qty;
  end loop;
  v_disc := round(v_sub * least(greatest(coalesce(p_discount_pct, 0), 0), 100) / 100, 2);
  v_tax := round((v_sub - v_disc) * v_rate / 100, 2);
  insert into orders (org_id, type, method, subtotal, discount, tax, total)
    values (p_org, p_type, p_method, v_sub, v_disc, v_tax, v_sub - v_disc + v_tax) returning id into v_order;
  for it in select value from jsonb_array_elements(p_items) loop
    v_qty := (it->>'qty')::int;
    insert into order_items (order_id, product_id, qty, unit_price)
      select v_order, id, v_qty, price from products where id = (it->>'id')::uuid;
    update products set stock = stock - v_qty where id = (it->>'id')::uuid;
  end loop;
  return v_order;
end $$;

revoke execute on function create_org(text) from public;
revoke execute on function checkout(uuid, text, text, numeric, jsonb) from public;
grant execute on function create_org(text) to authenticated;
grant execute on function checkout(uuid, text, text, numeric, jsonb) to authenticated;

alter publication supabase_realtime add table products;
