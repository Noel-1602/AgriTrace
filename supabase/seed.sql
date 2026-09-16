-- Demo dataset (PRD section 20)
-- Idempotent: clears demo rows by fixed IDs then re-inserts

delete from public.audit_logs where batch_id = '33333333-3333-3333-3333-333333333333';
delete from public.activities where batch_id = '33333333-3333-3333-3333-333333333333';
delete from public.verifications where batch_id = '33333333-3333-3333-3333-333333333333';
delete from public.batches where id = '33333333-3333-3333-3333-333333333333';
delete from public.farms where id = '22222222-2222-2222-2222-222222222222';
delete from public.farmers where id = '11111111-1111-1111-1111-111111111111';

insert into public.farmers (id, name, phone, email)
values (
  '11111111-1111-1111-1111-111111111111',
  'Ravi Kumar',
  '+91 98765 43210',
  'ravi.kumar@agritrace.demo'
);

insert into public.farms (id, farmer_id, farm_name, village, district, state, latitude, longitude)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Green Valley Farm',
  'Thiruvananthapuram',
  'Thiruvananthapuram',
  'Kerala',
  8.5241,
  76.9366
);

insert into public.batches (
  id, batch_code, farm_id, crop_name, variety, sowing_date, expected_harvest_date,
  harvest_date, quantity, unit, status
)
values (
  '33333333-3333-3333-3333-333333333333',
  'AGRI-2026-001',
  '22222222-2222-2222-2222-222222222222',
  'Tomato',
  'Anagha',
  '2026-06-10',
  '2026-09-15',
  '2026-09-15',
  100,
  'kg',
  'Harvested'
);

insert into public.activities (batch_id, activity_type, description, activity_date, latitude, longitude)
values
  ('33333333-3333-3333-3333-333333333333', 'Sowing', 'Seeds planted in prepared beds', '2026-06-10', 8.5241, 76.9366),
  ('33333333-3333-3333-3333-333333333333', 'Fertilizer Application', 'Organic compost applied', '2026-06-25', 8.5242, 76.9365),
  ('33333333-3333-3333-3333-333333333333', 'Irrigation', 'Field irrigation', '2026-07-05', 8.5240, 76.9367),
  ('33333333-3333-3333-3333-333333333333', 'Pest Management', 'Neem-based pest control', '2026-07-20', 8.5241, 76.9366),
  ('33333333-3333-3333-3333-333333333333', 'Harvest', '100 kg harvested', '2026-09-15', 8.5241, 76.9366);

insert into public.verifications (batch_id, verified_by, organization, status, remarks, verified_at)
values (
  '33333333-3333-3333-3333-333333333333',
  'Officer Priya Nair',
  'Green Farmers Cooperative',
  'VERIFIED',
  'Records and harvest evidence reviewed.',
  '2026-09-16T10:00:00+00:00'
);

insert into public.audit_logs (batch_id, action, field_name, new_value, edited_by, created_at)
values
  ('33333333-3333-3333-3333-333333333333', 'Batch Created', 'batch_code', 'AGRI-2026-001', 'Ravi Kumar', '2026-06-10T08:00:00+00:00'),
  ('33333333-3333-3333-3333-333333333333', 'Activity Added', 'activity_type', 'Sowing', 'Ravi Kumar', '2026-06-10T09:00:00+00:00'),
  ('33333333-3333-3333-3333-333333333333', 'Activity Added', 'activity_type', 'Fertilizer Application', 'Ravi Kumar', '2026-06-25T09:00:00+00:00'),
  ('33333333-3333-3333-3333-333333333333', 'Activity Added', 'activity_type', 'Harvest', 'Ravi Kumar', '2026-09-15T14:00:00+00:00'),
  ('33333333-3333-3333-3333-333333333333', 'Batch Verified', 'status', 'VERIFIED', 'Green Farmers Cooperative', '2026-09-16T10:00:00+00:00');
