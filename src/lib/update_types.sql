-- Allow 'fiziksel-altin' in the type column
alter table investments drop constraint if exists investments_type_check;
alter table investments add constraint investments_type_check 
  check (type in ('gram-altin', '22-ayar-bilezik', 'gumus', 'fiziksel-altin'));
