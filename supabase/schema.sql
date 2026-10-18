-- =============================================================
-- 个人作品集：可编辑内容（后台）数据库结构
-- 在 Supabase → SQL Editor 里整段执行即可
-- =============================================================

-- pgcrypto 提供 digest()（sha256），用于后台密码哈希
create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- 1) 站点信息（单行，id 恒为 1）
-- ---------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  name text not null default '',
  title text not null default '',
  tagline text not null default '',
  email text not null default '',
  avatar text not null default '',
  accent text not null default '#6c8cff',
  bio text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- 2) 后台密码哈希（单独放一张表，匿名用户不可读）
create table if not exists public.admin_secret (
  id int primary key default 1 check (id = 1),
  password_hash text not null default ''
);

-- 3) 社交链接
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  href text not null default '',
  sort_order int not null default 0
);

-- 4) 技能
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null default '',
  name text not null default '',
  icon text not null default '',
  level int not null default 80 check (level between 0 and 100),
  sort_order int not null default 0
);

-- 5) 经历 / 教育时间线
create table if not exists public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'experience' check (type in ('experience','education')),
  title text not null default '',
  org text not null default '',
  start_date text not null default '',
  end_date text,          -- null 表示「至今」
  description text not null default '',
  sort_order int not null default 0
);

-- 6) 联系表单留言（匿名只能插入，不可读/改/删）
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- RLS：匿名用户只能「读」公开内容，不能直接写
-- 所有写操作都走下面的 security definer 函数（内部校验密码）
-- ---------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.social_links enable row level security;
alter table public.skills enable row level security;
alter table public.timeline_items enable row level security;
alter table public.admin_secret enable row level security;
alter table public.contact_messages enable row level security;

-- 公开读
create policy "public_read_site" on public.site_settings for select to anon using (true);
create policy "public_read_socials" on public.social_links for select to anon using (true);
create policy "public_read_skills" on public.skills for select to anon using (true);
create policy "public_read_timeline" on public.timeline_items for select to anon using (true);

-- 联系表单：匿名只允许「插入」，不允许读取/修改/删除
create policy "anon_insert_contact" on public.contact_messages for insert to anon with check (true);

-- admin_secret 不对匿名开放（不加任何 anon 策略，默认拒绝读）

-- ---------------------------------------------------------
-- 密码校验（security definer：以表所有者身份运行，可读 admin_secret）
-- ---------------------------------------------------------
create or replace function public.admin_verify(p_password text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_secret
    where password_hash <> ''
      and password_hash = encode(digest(p_password, 'sha256'), 'hex')
  );
$$;

-- ---------------------------------------------------------
-- 保存函数（每个都先校验密码，失败抛异常）
-- 列表采用「先清空再整体写入」的简单策略，与后台表单「整段保存」一致
-- ---------------------------------------------------------

create or replace function public.admin_save_site(p_password text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_verify(p_password) then
    raise exception 'ADMIN_PASSWORD_INVALID';
  end if;
  insert into public.site_settings (id, name, title, tagline, email, avatar, accent, bio)
  values (
    1,
    coalesce(p_data->>'name', ''),
    coalesce(p_data->>'title', ''),
    coalesce(p_data->>'tagline', ''),
    coalesce(p_data->>'email', ''),
    coalesce(p_data->>'avatar', ''),
    coalesce(p_data->>'accent', '#6c8cff'),
    coalesce((p_data->'bio')::text[], '{}')
  )
  on conflict (id) do update set
    name = excluded.name,
    title = excluded.title,
    tagline = excluded.tagline,
    email = excluded.email,
    avatar = excluded.avatar,
    accent = excluded.accent,
    bio = excluded.bio,
    updated_at = now();
end;
$$;

create or replace function public.admin_save_socials(p_password text, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_verify(p_password) then
    raise exception 'ADMIN_PASSWORD_INVALID';
  end if;
  delete from public.social_links;
  insert into public.social_links (label, href, sort_order)
  select
    coalesce(x->>'label', ''),
    coalesce(x->>'href', ''),
    ord::int
  from jsonb_array_elements(p_items) with ordinality as t(x, ord);
end;
$$;

create or replace function public.admin_save_skills(p_password text, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_verify(p_password) then
    raise exception 'ADMIN_PASSWORD_INVALID';
  end if;
  delete from public.skills;
  insert into public.skills (category, name, icon, level, sort_order)
  select
    coalesce(x->>'category', ''),
    coalesce(x->>'name', ''),
    coalesce(x->>'icon', ''),
    coalesce((x->>'level')::int, 80),
    ord::int
  from jsonb_array_elements(p_items) with ordinality as t(x, ord);
end;
$$;

create or replace function public.admin_save_timeline(p_password text, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_verify(p_password) then
    raise exception 'ADMIN_PASSWORD_INVALID';
  end if;
  delete from public.timeline_items;
  insert into public.timeline_items (type, title, org, start_date, end_date, description, sort_order)
  select
    coalesce(x->>'type', 'experience'),
    coalesce(x->>'title', ''),
    coalesce(x->>'org', ''),
    coalesce(x->>'start_date', ''),
    nullif(x->>'end_date', ''),
    coalesce(x->>'description', ''),
    ord::int
  from jsonb_array_elements(p_items) with ordinality as t(x, ord);
end;
$$;

-- 修改后台密码（校验旧密码）
create or replace function public.admin_set_password(p_password text, p_new_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_verify(p_password) then
    raise exception 'ADMIN_PASSWORD_INVALID';
  end if;
  insert into public.admin_secret (id, password_hash)
  values (1, encode(digest(p_new_password, 'sha256'), 'hex'))
  on conflict (id) do update set password_hash = excluded.password_hash;
end;
$$;

-- ---------------------------------------------------------
-- 首次配置：判断是否已设置后台密码，以及「仅在未配置时」设置初始密码
-- 解决「没密码无法登录、无法登录就无法设密码」的循环
-- ---------------------------------------------------------
create or replace function public.admin_is_configured()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_secret
    where password_hash <> ''
  );
$$;

create or replace function public.admin_setup_password(p_new_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.admin_is_configured() then
    raise exception 'ADMIN_ALREADY_CONFIGURED';
  end if;
  if coalesce(length(p_new_password), 0) < 6 then
    raise exception 'ADMIN_PASSWORD_TOO_SHORT';
  end if;
  insert into public.admin_secret (id, password_hash)
  values (1, encode(digest(p_new_password, 'sha256'), 'hex'))
  on conflict (id) do update set password_hash = excluded.password_hash;
end;
$$;

-- ---------------------------------------------------------
-- 种子数据：把当前 content/data/*.ts 的默认内容写入，网站观感不变
-- ---------------------------------------------------------

insert into public.site_settings (id, name, title, tagline, email, avatar, accent, bio)
values (
  1,
  '王世瑞',
  '全栈开发工程师',
  '用代码构建优雅、高性能的 Web 体验，专注前端工程与用户体验。',
  'hello@example.com',
  '王世瑞',
  '#6c8cff',
  array[
    '我是一名热爱 Web 的全栈开发工程师，拥有多年的前端工程与 Node.js 服务端经验，参与过多个从 0 到 1 的产品落地。',
    '我喜欢把复杂的交互做得简洁，把性能优化做到细节里。工作之外，我会写博客记录技术思考，也喜欢开源社区。'
  ]
)
on conflict (id) do nothing;

insert into public.social_links (label, href, sort_order) values
  ('GitHub', 'https://github.com', 1),
  ('X / Twitter', 'https://twitter.com', 2),
  ('LinkedIn', 'https://linkedin.com', 3);

insert into public.skills (category, name, icon, level, sort_order) values
  ('前端', 'TypeScript', '🔷', 92, 1),
  ('前端', 'React / Next.js', '⚛️', 90, 2),
  ('前端', 'Tailwind CSS', '🎨', 88, 3),
  ('前端', 'Vue', '🟢', 75, 4),
  ('后端', 'Node.js', '🟩', 85, 5),
  ('后端', 'PostgreSQL', '🐘', 80, 6),
  ('后端', 'GraphQL', '🔺', 72, 7),
  ('后端', 'Redis', '🔴', 70, 8),
  ('工具与工程化', 'Git / CI', '🔧', 88, 9),
  ('工具与工程化', 'Docker', '🐳', 75, 10),
  ('工具与工程化', 'Vite / Webpack', '⚡', 82, 11);

insert into public.timeline_items (type, title, org, start_date, end_date, description, sort_order) values
  ('experience', '高级前端工程师', '某科技公司', '2023-06', null, '负责核心 Web 应用的架构设计与性能优化，推动组件库与工程化落地。', 1),
  ('experience', '前端工程师', '某互联网公司', '2020-07', '2023-05', '参与多个业务线的迭代开发，负责数据可视化与移动端适配。', 2),
  ('education', '计算机科学与技术 · 学士', '某大学', '2016-09', '2020-06', '主修计算机基础、算法与 Web 开发，多次获得奖学金。', 3);

-- ---------------------------------------------------------
-- 后台默认密码：123456（写入 sha256 哈希）
-- 首次登录后请到后台「修改密码」改为你自己的强密码。
-- 如需在部署前改成其他默认密码，修改下面这条 SQL 里的字面量即可。
-- ---------------------------------------------------------
insert into public.admin_secret (id, password_hash)
values (1, encode(digest('123456', 'sha256'), 'hex'))
on conflict (id) do update set password_hash = excluded.password_hash;
