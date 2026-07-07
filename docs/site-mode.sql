-- Shop Web re - site mode support
-- Run once in Supabase SQL Editor.
-- catalog: keep storefront visible but disable direct selling flows.
-- sales: enable cart, checkout, payment and downloads.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'site_settings_key_unique'
      and conrelid = 'public.site_settings'::regclass
  ) then
    alter table public.site_settings
    add constraint site_settings_key_unique unique (key);
  end if;
end $$;

insert into public.site_settings (key, value, type, group_name, description)
values (
  'site_mode',
  'catalog',
  'string',
  'general',
  'Website mode: catalog disables direct sales; sales enables checkout and downloads.'
)
on conflict (key) do nothing;
