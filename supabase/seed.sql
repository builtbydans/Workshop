-- Northside Motor Co. — portfolio demo dataset for Workshop
-- Destructive reset: clears operational data and inserts a curated scenario
-- spanning new enquiries, active workshop jobs, and historical completed work.
--
-- Run locally:  supabase db reset
-- Run in prod:   paste into Supabase SQL editor (back up first)

begin;

truncate table
  public.invoice_lines,
  public.invoices,
  public.job_raise_notes,
  public.job_raises,
  public.work_items,
  public.job_updates,
  public.audit_logs,
  public.jobs,
  public.vehicles,
  public.customers,
  public.employees
restart identity cascade;

alter sequence public.job_number_seq restart with 1;
alter sequence public.invoice_number_seq restart with 1;

-- ---------------------------------------------------------------------------
-- Employees (1 manager, 1 admin, 4 technicians)
-- ---------------------------------------------------------------------------
insert into public.employees (id, first_name, last_name, role, active) values
  ('e1000000-0000-4000-8000-000000000001', 'Sarah', 'Mitchell', 'MANAGER', true),
  ('e1000000-0000-4000-8000-000000000002', 'Tom', 'Hughes', 'ADMIN', true),
  ('e1000000-0000-4000-8000-000000000003', 'Liam', 'Foster', 'TECHNICIAN', true),
  ('e1000000-0000-4000-8000-000000000004', 'Priya', 'Shah', 'TECHNICIAN', true),
  ('e1000000-0000-4000-8000-000000000005', 'Callum', 'Reid', 'TECHNICIAN', true),
  ('e1000000-0000-4000-8000-000000000006', 'Mia', 'Brooks', 'TECHNICIAN', true);

-- ---------------------------------------------------------------------------
-- Customers (25)
-- ---------------------------------------------------------------------------
insert into public.customers (id, first_name, last_name, phone, email) values
  ('c1000000-0000-4000-8000-000000000001', 'James', 'Carter', '07700100101', 'james.carter@email.com'),
  ('c1000000-0000-4000-8000-000000000002', 'Emma', 'Wilson', '07700100102', 'emma.wilson@email.com'),
  ('c1000000-0000-4000-8000-000000000003', 'David', 'Hughes', '07700100103', 'david.hughes@email.com'),
  ('c1000000-0000-4000-8000-000000000004', 'Sophie', 'Davies', '07700100104', 'sophie.davies@email.com'),
  ('c1000000-0000-4000-8000-000000000005', 'Oliver', 'Green', '07700100105', 'oliver.green@email.com'),
  ('c1000000-0000-4000-8000-000000000006', 'Charlotte', 'White', '07700100106', 'charlotte.white@email.com'),
  ('c1000000-0000-4000-8000-000000000007', 'Ben', 'Robinson', '07700100107', 'ben.robinson@email.com'),
  ('c1000000-0000-4000-8000-000000000008', 'Amy', 'Thompson', '07700100108', 'amy.thompson@email.com'),
  ('c1000000-0000-4000-8000-000000000009', 'Ryan', 'Cooper', '07700100109', 'ryan.cooper@email.com'),
  ('c1000000-0000-4000-8000-000000000010', 'Laura', 'Foster', '07700100110', 'laura.foster@email.com'),
  ('c1000000-0000-4000-8000-000000000011', 'Nathan', 'Collins', '07700100111', 'nathan.collins@email.com'),
  ('c1000000-0000-4000-8000-000000000012', 'Jessica', 'Wood', '07700100112', 'jessica.wood@email.com'),
  ('c1000000-0000-4000-8000-000000000013', 'Marcus', 'Patel', '07700100113', 'marcus.patel@email.com'),
  ('c1000000-0000-4000-8000-000000000014', 'Hannah', 'Murray', '07700100114', 'hannah.murray@email.com'),
  ('c1000000-0000-4000-8000-000000000015', 'Chris', 'Baker', '07700100115', 'chris.baker@email.com'),
  ('c1000000-0000-4000-8000-000000000016', 'Kate', 'Morgan', '07700100116', 'kate.morgan@email.com'),
  ('c1000000-0000-4000-8000-000000000017', 'Daniel', 'Price', '07700100117', 'daniel.price@email.com'),
  ('c1000000-0000-4000-8000-000000000018', 'Rachel', 'Singh', '07700100118', 'rachel.singh@email.com'),
  ('c1000000-0000-4000-8000-000000000019', 'Simon', 'Walsh', '07700100119', 'simon.walsh@email.com'),
  ('c1000000-0000-4000-8000-000000000020', 'Ella', 'Campbell', '07700100120', 'ella.campbell@email.com'),
  ('c1000000-0000-4000-8000-000000000021', 'George', 'Turner', '07700100121', 'george.turner@email.com'),
  ('c1000000-0000-4000-8000-000000000022', 'Megan', 'Clark', '07700100122', 'megan.clark@email.com'),
  ('c1000000-0000-4000-8000-000000000023', 'Adam', 'Reed', '07700100123', 'adam.reed@email.com'),
  ('c1000000-0000-4000-8000-000000000024', 'Lucy', 'Bennett', '07700100124', 'lucy.bennett@email.com'),
  ('c1000000-0000-4000-8000-000000000025', 'Tom', 'Fletcher', '07700100125', 'tom.fletcher@email.com');

-- ---------------------------------------------------------------------------
-- Vehicles (32 — repeat customers have history)
-- ---------------------------------------------------------------------------
insert into public.vehicles (id, customer_id, registration, make, model) values
  ('b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'AB12 CDE', 'Ford', 'Focus'),
  ('b1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'FG34 HIJ', 'Ford', 'Transit Custom'),
  ('b1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', 'KL56 MNO', 'Volkswagen', 'Golf'),
  ('b1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000003', 'PQ78 RST', 'BMW', '320d'),
  ('b1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000004', 'UV90 WXY', 'Audi', 'A3'),
  ('b1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000005', 'CD11 EFG', 'Toyota', 'Yaris'),
  ('b1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000006', 'HJ22 KLM', 'Mercedes-Benz', 'A-Class'),
  ('b1000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000007', 'NP33 QRS', 'Vauxhall', 'Corsa'),
  ('b1000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000008', 'TU44 VWX', 'Nissan', 'Qashqai'),
  ('b1000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000009', 'YZ55 ABC', 'Peugeot', '208'),
  ('b1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000010', 'DE66 FGH', 'Skoda', 'Octavia'),
  ('b1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000011', 'IJ77 KLM', 'Honda', 'Civic'),
  ('b1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000012', 'NO88 PQR', 'Renault', 'Clio'),
  ('b1000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000012', 'ST99 UVW', 'Fiat', '500'),
  ('b1000000-0000-4000-8000-000000000015', 'c1000000-0000-4000-8000-000000000013', 'WX12 YZA', 'Volvo', 'XC40'),
  ('b1000000-0000-4000-8000-000000000016', 'c1000000-0000-4000-8000-000000000014', 'BC23 DEF', 'Kia', 'Sportage'),
  ('b1000000-0000-4000-8000-000000000017', 'c1000000-0000-4000-8000-000000000015', 'GH34 IJK', 'Hyundai', 'i30'),
  ('b1000000-0000-4000-8000-000000000018', 'c1000000-0000-4000-8000-000000000016', 'LM45 NOP', 'Mazda', 'CX-5'),
  ('b1000000-0000-4000-8000-000000000019', 'c1000000-0000-4000-8000-000000000017', 'QR56 STU', 'Seat', 'Leon'),
  ('b1000000-0000-4000-8000-000000000020', 'c1000000-0000-4000-8000-000000000018', 'VW67 XYZ', 'Mini', 'Cooper'),
  ('b1000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000019', 'AB78 CDE', 'Land Rover', 'Discovery Sport'),
  ('b1000000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000020', 'FG89 HIJ', 'Citroen', 'C3'),
  ('b1000000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000021', 'KL01 MNO', 'Ford', 'Puma'),
  ('b1000000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000022', 'PQ12 RST', 'Toyota', 'Corolla'),
  ('b1000000-0000-4000-8000-000000000025', 'c1000000-0000-4000-8000-000000000023', 'UV23 WXY', 'Volkswagen', 'Tiguan'),
  ('b1000000-0000-4000-8000-000000000026', 'c1000000-0000-4000-8000-000000000024', 'CD34 EFG', 'Audi', 'Q3'),
  ('b1000000-0000-4000-8000-000000000027', 'c1000000-0000-4000-8000-000000000025', 'HJ45 KLM', 'BMW', '118i'),
  ('b1000000-0000-4000-8000-000000000028', 'c1000000-0000-4000-8000-000000000002', 'NP56 QRS', 'Volkswagen', 'Polo'),
  ('b1000000-0000-4000-8000-000000000029', 'c1000000-0000-4000-8000-000000000003', 'TU67 VWX', 'BMW', 'X1'),
  ('b1000000-0000-4000-8000-000000000030', 'c1000000-0000-4000-8000-000000000010', 'YZ78 ABC', 'Skoda', 'Fabia'),
  ('b1000000-0000-4000-8000-000000000031', 'c1000000-0000-4000-8000-000000000015', 'DE89 FGH', 'Hyundai', 'Tucson'),
  ('b1000000-0000-4000-8000-000000000032', 'c1000000-0000-4000-8000-000000000018', 'IJ90 KLM', 'Mini', 'Countryman');

-- ---------------------------------------------------------------------------
-- Jobs (45) — new enquiries, active workshop, and historical work
-- Timestamps use now() so the dashboard always looks current.
-- ---------------------------------------------------------------------------
insert into public.jobs (
  id, vehicle_id, job_number, job_type, description, status,
  quoted_cost, deposit_amount, deposit_received_at,
  assigned_technician_id, actual_cost, created_at, updated_at
) values
  -- New enquiries (LEAD)
  ('a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000013', 'JOB-2026-000001', 'General enquiry', 'Clutch pedal feels heavy, possible slave cylinder', 'LEAD', null, null, null, null, null, now() - interval '2 hours', now() - interval '2 hours'),
  ('a1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000014', 'JOB-2026-000002', 'Service', 'Annual service quote requested', 'LEAD', null, null, null, null, null, now() - interval '5 hours', now() - interval '5 hours'),
  ('a1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000022', 'JOB-2026-000003', 'Diagnostics', 'Intermittent misfire on cold start', 'LEAD', null, null, null, null, null, now() - interval '1 day', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000027', 'JOB-2026-000004', 'Tyres', 'Customer wants quote for winter tyres', 'LEAD', null, null, null, null, null, now() - interval '3 hours', now() - interval '3 hours'),

  -- Quoted — awaiting customer decision
  ('a1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000015', 'JOB-2026-000005', 'Brakes', 'Front pads, discs and brake fluid change', 'QUOTED', 485.00, 120.00, null, null, null, now() - interval '2 days', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000016', 'JOB-2026-000006', 'MOT', 'MOT test and pre-check', 'QUOTED', 54.85, 0.00, null, null, null, now() - interval '3 days', now() - interval '2 days'),
  ('a1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000023', 'JOB-2026-000007', 'Service', 'Full service including cambelt inspection', 'QUOTED', 329.00, 80.00, null, null, null, now() - interval '4 days', now() - interval '3 days'),

  -- Awaiting deposit
  ('a1000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000003', 'JOB-2026-000008', 'Brakes', 'Front pads and discs', 'AWAITING_DEPOSIT', 420.00, 100.00, null, null, null, now() - interval '5 days', now() - interval '4 days'),
  ('a1000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000017', 'JOB-2026-000009', 'Suspension', 'Drop links and track rod ends', 'AWAITING_DEPOSIT', 380.00, 95.00, null, null, null, now() - interval '6 days', now() - interval '5 days'),
  ('a1000000-0000-4000-8000-000000000010', 'b1000000-0000-4000-8000-000000000028', 'JOB-2026-000010', 'Clutch', 'Clutch replacement quote accepted pending deposit', 'AWAITING_DEPOSIT', 890.00, 200.00, null, null, null, now() - interval '3 days', now() - interval '2 days'),

  -- Booked / upcoming (some touched today for dashboard)
  ('a1000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000004', 'JOB-2026-000011', 'Diagnostics', 'Engine management light — booked for tomorrow', 'BOOKED', 95.00, 0.00, now() - interval '1 day', 'e1000000-0000-4000-8000-000000000003', null, now() - interval '4 days', now() - interval '30 minutes'),
  ('a1000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000018', 'JOB-2026-000012', 'Service', 'Interim service — drop-off Friday', 'BOOKED', 189.00, 50.00, now() - interval '2 days', 'e1000000-0000-4000-8000-000000000004', null, now() - interval '5 days', now() - interval '1 hour'),
  ('a1000000-0000-4000-8000-000000000013', 'b1000000-0000-4000-8000-000000000024', 'JOB-2026-000013', 'MOT', 'MOT and emissions check', 'BOOKED', 54.85, 0.00, now() - interval '3 days', 'e1000000-0000-4000-8000-000000000005', null, now() - interval '6 days', now() - interval '2 hours'),
  ('a1000000-0000-4000-8000-000000000014', 'b1000000-0000-4000-8000-000000000025', 'JOB-2026-000014', 'Diagnostics', 'DPF warning light investigation', 'BOOKED', 120.00, 30.00, now() - interval '1 day', 'e1000000-0000-4000-8000-000000000006', null, now() - interval '3 days', now()),
  ('a1000000-0000-4000-8000-000000000015', 'b1000000-0000-4000-8000-000000000029', 'JOB-2026-000015', 'Tyres', 'Two tyres and four-wheel alignment', 'BOOKED', 265.00, 65.00, now() - interval '2 days', 'e1000000-0000-4000-8000-000000000003', null, now() - interval '4 days', now() - interval '45 minutes'),

  -- Awaiting parts
  ('a1000000-0000-4000-8000-000000000016', 'b1000000-0000-4000-8000-000000000005', 'JOB-2026-000016', 'Suspension', 'Knocking from nearside front — strut on order', 'AWAITING_PARTS', 560.00, 150.00, now() - interval '6 days', 'e1000000-0000-4000-8000-000000000004', null, now() - interval '8 days', now() - interval '3 hours'),
  ('a1000000-0000-4000-8000-000000000017', 'b1000000-0000-4000-8000-000000000019', 'JOB-2026-000017', 'Brakes', 'Rear caliper seized — caliper back-ordered', 'AWAITING_PARTS', 340.00, 85.00, now() - interval '5 days', 'e1000000-0000-4000-8000-000000000005', null, now() - interval '7 days', now() - interval '5 hours'),
  ('a1000000-0000-4000-8000-000000000018', 'b1000000-0000-4000-8000-000000000021', 'JOB-2026-000018', 'Electrical', 'Alternator replacement — part due Thursday', 'AWAITING_PARTS', 445.00, 110.00, now() - interval '4 days', 'e1000000-0000-4000-8000-000000000006', null, now() - interval '6 days', now() - interval '1 hour'),

  -- Today's board (keep lean — 5 jobs across active workshop statuses)
  ('a1000000-0000-4000-8000-000000000019', 'b1000000-0000-4000-8000-000000000006', 'JOB-2026-000019', 'Service', 'Major service and spark plugs — bay 4', 'IN_PROGRESS', 310.00, 80.00, now() - interval '5 days', 'e1000000-0000-4000-8000-000000000003', 145.00, now() - interval '6 days', now() - interval '20 minutes'),
  ('a1000000-0000-4000-8000-000000000020', 'b1000000-0000-4000-8000-000000000007', 'JOB-2026-000020', 'Clutch', 'Dual-mass flywheel and clutch kit — bay 2', 'IN_PROGRESS', 1240.00, 300.00, now() - interval '7 days', 'e1000000-0000-4000-8000-000000000004', 680.00, now() - interval '9 days', now() - interval '40 minutes'),
  ('a1000000-0000-4000-8000-000000000023', 'b1000000-0000-4000-8000-000000000009', 'JOB-2026-000023', 'MOT', 'Pre-MOT inspection and remedial work', 'AWAITING_REVIEW', 275.00, 0.00, now() - interval '6 days', 'e1000000-0000-4000-8000-000000000005', 220.00, now() - interval '7 days', now() - interval '2 hours'),
  ('a1000000-0000-4000-8000-000000000026', 'b1000000-0000-4000-8000-000000000010', 'JOB-2026-000026', 'Tyres', 'Two tyres and alignment — road test pending', 'FINAL_INSPECTION', 240.00, 60.00, now() - interval '7 days', 'e1000000-0000-4000-8000-000000000004', 198.00, now() - interval '8 days', now() - interval '1 hour'),
  ('a1000000-0000-4000-8000-000000000028', 'b1000000-0000-4000-8000-000000000012', 'JOB-2026-000028', 'Air conditioning', 'A/C regas and leak check — ready to collect', 'READY_FOR_COLLECTION', 165.00, 0.00, now() - interval '8 days', 'e1000000-0000-4000-8000-000000000005', 132.00, now() - interval '9 days', now() - interval '30 minutes'),

  -- Formerly active board jobs — completed to keep Today's Jobs at 5
  ('a1000000-0000-4000-8000-000000000021', 'b1000000-0000-4000-8000-000000000008', 'JOB-2026-000021', 'Brakes', 'Front and rear brake overhaul', 'COMPLETED', 520.00, 130.00, now() - interval '4 days', 'e1000000-0000-4000-8000-000000000005', 290.00, now() - interval '5 days', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000022', 'b1000000-0000-4000-8000-000000000031', 'JOB-2026-000022', 'Diagnostics', 'Turbo boost fault — live data logging', 'COMPLETED', 180.00, 0.00, now() - interval '2 days', 'e1000000-0000-4000-8000-000000000006', 95.00, now() - interval '3 days', now() - interval '2 days'),
  ('a1000000-0000-4000-8000-000000000024', 'b1000000-0000-4000-8000-000000000020', 'JOB-2026-000024', 'Bodywork', 'Bumper scuff repair and blend', 'COMPLETED', 395.00, 100.00, now() - interval '5 days', 'e1000000-0000-4000-8000-000000000003', 310.00, now() - interval '6 days', now() - interval '3 days'),
  ('a1000000-0000-4000-8000-000000000025', 'b1000000-0000-4000-8000-000000000026', 'JOB-2026-000025', 'Service', 'Full service with brake check', 'COMPLETED', 245.00, 60.00, now() - interval '4 days', 'e1000000-0000-4000-8000-000000000004', 198.00, now() - interval '5 days', now() - interval '2 days'),
  ('a1000000-0000-4000-8000-000000000027', 'b1000000-0000-4000-8000-000000000011', 'JOB-2026-000027', 'Brakes', 'Rear brake service — final check', 'COMPLETED', 205.00, 50.00, now() - interval '6 days', 'e1000000-0000-4000-8000-000000000006', 176.00, now() - interval '7 days', now() - interval '4 days'),
  ('a1000000-0000-4000-8000-000000000029', 'b1000000-0000-4000-8000-000000000030', 'JOB-2026-000029', 'Battery', 'Battery replacement and charging system test', 'COMPLETED', 145.00, 0.00, now() - interval '5 days', 'e1000000-0000-4000-8000-000000000003', 118.00, now() - interval '6 days', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000030', 'b1000000-0000-4000-8000-000000000032', 'JOB-2026-000030', 'Service', 'Interim service completed — awaiting pickup', 'COMPLETED', 159.00, 40.00, now() - interval '4 days', 'e1000000-0000-4000-8000-000000000006', 134.00, now() - interval '5 days', now() - interval '12 hours'),

  -- Invoiced (awaiting payment)
  ('a1000000-0000-4000-8000-000000000031', 'b1000000-0000-4000-8000-000000000001', 'JOB-2026-000031', 'Service', 'Interim service — invoice sent', 'INVOICED', 149.00, 0.00, now() - interval '10 days', 'e1000000-0000-4000-8000-000000000003', 121.00, now() - interval '11 days', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000032', 'b1000000-0000-4000-8000-000000000002', 'JOB-2026-000032', 'Service', 'Fleet van interim service', 'INVOICED', 175.00, 0.00, now() - interval '9 days', 'e1000000-0000-4000-8000-000000000004', 142.00, now() - interval '10 days', now() - interval '2 days'),

  -- Completed (one finished today for dashboard revenue)
  ('a1000000-0000-4000-8000-000000000033', 'b1000000-0000-4000-8000-000000000030', 'JOB-2026-000033', 'MOT', 'MOT pass — advisory notes issued', 'COMPLETED', 54.85, 0.00, now() - interval '1 day', 'e1000000-0000-4000-8000-000000000005', 54.85, now() - interval '2 days', now()),
  ('a1000000-0000-4000-8000-000000000034', 'b1000000-0000-4000-8000-000000000001', 'JOB-2026-000034', 'Diagnostics', 'Fault code read and cleared — no fault found', 'COMPLETED', 65.00, 0.00, now() - interval '14 days', 'e1000000-0000-4000-8000-000000000003', 65.00, now() - interval '16 days', now() - interval '12 days'),
  ('a1000000-0000-4000-8000-000000000035', 'b1000000-0000-4000-8000-000000000003', 'JOB-2026-000035', 'Tyres', 'Two budget tyres fitted', 'COMPLETED', 180.00, 0.00, now() - interval '21 days', 'e1000000-0000-4000-8000-000000000004', 156.00, now() - interval '23 days', now() - interval '20 days'),
  ('a1000000-0000-4000-8000-000000000036', 'b1000000-0000-4000-8000-000000000016', 'JOB-2026-000036', 'Brakes', 'Rear pads replaced', 'COMPLETED', 195.00, 0.00, now() - interval '28 days', 'e1000000-0000-4000-8000-000000000005', 168.00, now() - interval '30 days', now() - interval '27 days'),

  -- Paid (historical)
  ('a1000000-0000-4000-8000-000000000037', 'b1000000-0000-4000-8000-000000000011', 'JOB-2026-000037', 'Brakes', 'Rear brake service', 'PAID', 205.00, 0.00, now() - interval '35 days', 'e1000000-0000-4000-8000-000000000004', 176.00, now() - interval '38 days', now() - interval '33 days'),
  ('a1000000-0000-4000-8000-000000000038', 'b1000000-0000-4000-8000-000000000004', 'JOB-2026-000038', 'Service', 'Full service', 'PAID', 289.00, 0.00, now() - interval '42 days', 'e1000000-0000-4000-8000-000000000003', 245.00, now() - interval '45 days', now() - interval '40 days'),
  ('a1000000-0000-4000-8000-000000000039', 'b1000000-0000-4000-8000-000000000005', 'JOB-2026-000039', 'Clutch', 'Clutch kit replacement', 'PAID', 980.00, 250.00, now() - interval '50 days', 'e1000000-0000-4000-8000-000000000005', 845.00, now() - interval '55 days', now() - interval '48 days'),
  ('a1000000-0000-4000-8000-000000000040', 'b1000000-0000-4000-8000-000000000006', 'JOB-2026-000040', 'MOT', 'MOT and minor advisories rectified', 'PAID', 189.00, 0.00, now() - interval '60 days', 'e1000000-0000-4000-8000-000000000006', 165.00, now() - interval '63 days', now() - interval '58 days'),
  ('a1000000-0000-4000-8000-000000000041', 'b1000000-0000-4000-8000-000000000007', 'JOB-2026-000041', 'Diagnostics', 'ABS sensor replaced', 'PAID', 220.00, 0.00, now() - interval '70 days', 'e1000000-0000-4000-8000-000000000004', 185.00, now() - interval '72 days', now() - interval '68 days'),
  ('a1000000-0000-4000-8000-000000000042', 'b1000000-0000-4000-8000-000000000009', 'JOB-2026-000042', 'Battery', 'Stop-start battery replacement', 'PAID', 165.00, 0.00, now() - interval '80 days', 'e1000000-0000-4000-8000-000000000003', 138.00, now() - interval '82 days', now() - interval '78 days'),

  -- Lost quotes
  ('a1000000-0000-4000-8000-000000000043', 'b1000000-0000-4000-8000-000000000012', 'JOB-2026-000043', 'Diagnostics', 'Quote not accepted — customer went elsewhere', 'LOST', 120.00, null, null, null, null, now() - interval '15 days', now() - interval '10 days'),
  ('a1000000-0000-4000-8000-000000000044', 'b1000000-0000-4000-8000-000000000015', 'JOB-2026-000044', 'Engine', 'Head gasket quote declined', 'LOST', 1450.00, null, null, null, null, now() - interval '25 days', now() - interval '20 days'),
  ('a1000000-0000-4000-8000-000000000045', 'b1000000-0000-4000-8000-000000000022', 'JOB-2026-000045', 'Service', 'Customer sold vehicle — quote cancelled', 'LOST', 189.00, null, null, null, null, now() - interval '8 days', now() - interval '6 days');

-- ---------------------------------------------------------------------------
-- Work items (on active and completed jobs)
-- ---------------------------------------------------------------------------
insert into public.work_items (id, job_id, kind, origin, description, quantity, unit_cost, unit_price, sort_order, created_by_employee_id) values
  ('f1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000019', 'LABOUR', 'QUOTED', 'Major service labour', 2.5, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000003'),
  ('f1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000019', 'PARTS', 'QUOTED', 'Oil filter, plugs and air filter', 1, 34.00, 58.00, 2, 'e1000000-0000-4000-8000-000000000003'),
  ('f1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000020', 'LABOUR', 'QUOTED', 'Clutch and flywheel labour', 6.0, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000004'),
  ('f1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000020', 'PARTS', 'QUOTED', 'Clutch kit and dual-mass flywheel', 1, 420.00, 580.00, 2, 'e1000000-0000-4000-8000-000000000004'),
  ('f1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000021', 'LABOUR', 'QUOTED', 'Brake overhaul labour', 3.0, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000005'),
  ('f1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000021', 'PARTS', 'QUOTED', 'Pads, discs and fluid', 1, 145.00, 210.00, 2, 'e1000000-0000-4000-8000-000000000005'),
  ('f1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000023', 'LABOUR', 'QUOTED', 'MOT prep labour', 1.5, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000005'),
  ('f1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000023', 'PARTS', 'ADDITIONAL', 'Bulbs and wiper blades', 1, 18.00, 32.00, 2, 'e1000000-0000-4000-8000-000000000005'),
  ('f1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000028', 'LABOUR', 'QUOTED', 'A/C regas labour', 1.0, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000005'),
  ('f1000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000028', 'MATERIALS', 'QUOTED', 'Refrigerant and dye', 1, 22.00, 45.00, 2, 'e1000000-0000-4000-8000-000000000005'),
  ('f1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000031', 'LABOUR', 'QUOTED', 'Interim service labour', 1.5, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000003'),
  ('f1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000031', 'PARTS', 'QUOTED', 'Oil and filter', 1, 24.00, 42.00, 2, 'e1000000-0000-4000-8000-000000000003'),
  ('f1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000037', 'LABOUR', 'QUOTED', 'Rear brake service labour', 1.5, 28.00, 55.00, 1, 'e1000000-0000-4000-8000-000000000004'),
  ('f1000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000037', 'PARTS', 'QUOTED', 'Rear pads and hardware', 1, 38.00, 68.00, 2, 'e1000000-0000-4000-8000-000000000004');

-- ---------------------------------------------------------------------------
-- Job raises (open + resolved for dashboard "Needs attention")
-- ---------------------------------------------------------------------------
insert into public.job_raises (id, job_id, raised_by_employee_id, status, created_at, updated_at, acknowledged_at, acknowledged_by_employee_id, resolved_at, resolved_by_employee_id) values
  ('d1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000019', 'e1000000-0000-4000-8000-000000000003', 'OPEN', now() - interval '2 hours', now() - interval '30 minutes', null, null, null, null),
  ('d1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000020', 'e1000000-0000-4000-8000-000000000004', 'OPEN', now() - interval '4 hours', now() - interval '1 hour', null, null, null, null),
  ('d1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000016', 'e1000000-0000-4000-8000-000000000004', 'ACKNOWLEDGED', now() - interval '1 day', now() - interval '6 hours', now() - interval '8 hours', 'e1000000-0000-4000-8000-000000000001', null, null),
  ('d1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000035', 'e1000000-0000-4000-8000-000000000005', 'RESOLVED', now() - interval '22 days', now() - interval '20 days', now() - interval '21 days', 'e1000000-0000-4000-8000-000000000001', now() - interval '20 days', 'e1000000-0000-4000-8000-000000000001');

insert into public.job_raise_notes (raise_id, employee_id, body, created_at) values
  ('d1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'Found worn rear brake hose during service. Needs manager approval before continuing.', now() - interval '2 hours'),
  ('d1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'Flywheel surface scored — customer may need new DMF. Awaiting go-ahead.', now() - interval '4 hours'),
  ('d1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000004', 'Strut delivery delayed to Thursday. Customer notified.', now() - interval '1 day'),
  ('d1000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000005', 'Wrong tyre size supplied — reordered correct spec.', now() - interval '22 days');

-- ---------------------------------------------------------------------------
-- Job updates (timeline + recent activity feed)
-- ---------------------------------------------------------------------------
insert into public.job_updates (job_id, message, created_at) values
  ('a1000000-0000-4000-8000-000000000001', 'New web enquiry received — clutch issue', now() - interval '2 hours'),
  ('a1000000-0000-4000-8000-000000000011', 'Customer confirmed drop-off for diagnostics', now() - interval '30 minutes'),
  ('a1000000-0000-4000-8000-000000000014', 'Vehicle booked in — DPF investigation', now() - interval '1 hour'),
  ('a1000000-0000-4000-8000-000000000019', 'Vehicle booked in for major service', now() - interval '6 days'),
  ('a1000000-0000-4000-8000-000000000019', 'Work started on service bay 4', now() - interval '5 days'),
  ('a1000000-0000-4000-8000-000000000019', 'Technician raised concern — rear brake hose', now() - interval '2 hours'),
  ('a1000000-0000-4000-8000-000000000020', 'Gearbox removed — inspecting flywheel', now() - interval '40 minutes'),
  ('a1000000-0000-4000-8000-000000000021', 'All four corners stripped — rebuild in progress', now() - interval '20 minutes'),
  ('a1000000-0000-4000-8000-000000000028', 'A/C system tested and recharged', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000028', 'Ready for customer collection — called twice', now() - interval '30 minutes'),
  ('a1000000-0000-4000-8000-000000000031', 'Invoice issued to customer', now() - interval '1 day'),
  ('a1000000-0000-4000-8000-000000000033', 'MOT passed — advisories noted on wipers', now() - interval '1 hour'),
  ('a1000000-0000-4000-8000-000000000037', 'Payment received — thank you', now() - interval '33 days');

-- ---------------------------------------------------------------------------
-- Invoices (draft, unpaid, paid, void)
-- ---------------------------------------------------------------------------
insert into public.invoices (
  id, job_id, invoice_number, status, subtotal, discount, vat_rate, vat, total,
  deposit_paid, amount_paid, issued_at, paid_at, voided_at,
  job_number, customer_name, customer_email, customer_phone,
  vehicle_registration, vehicle_make, vehicle_model,
  created_at, updated_at
) values
  (
    '01000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000028',
    'INV-2026-000001',
    'DRAFT',
    132.00, 0.00, 20.00, 26.40, 158.40,
    0.00, 0.00, null, null, null,
    'JOB-2026-000028', 'Nathan Collins', 'nathan.collins@email.com', '07700100111',
    'IJ77 KLM', 'Honda', 'Civic',
    now() - interval '2 hours', now() - interval '2 hours'
  ),
  (
    '01000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000031',
    'INV-2026-000002',
    'UNPAID',
    121.00, 0.00, 20.00, 24.20, 145.20,
    0.00, 0.00, now() - interval '1 day', null, null,
    'JOB-2026-000031', 'James Carter', 'james.carter@email.com', '07700100101',
    'AB12 CDE', 'Ford', 'Focus',
    now() - interval '1 day', now() - interval '1 day'
  ),
  (
    '01000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000032',
    'INV-2026-000003',
    'UNPAID',
    142.00, 0.00, 20.00, 28.40, 170.40,
    0.00, 0.00, now() - interval '2 days', null, null,
    'JOB-2026-000032', 'James Carter', 'james.carter@email.com', '07700100101',
    'FG34 HIJ', 'Ford', 'Transit Custom',
    now() - interval '2 days', now() - interval '2 days'
  ),
  (
    '01000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000037',
    'INV-2026-000004',
    'PAID',
    176.00, 0.00, 20.00, 35.20, 211.20,
    0.00, 211.20, now() - interval '34 days', now() - interval '33 days', null,
    'JOB-2026-000037', 'Laura Foster', 'laura.foster@email.com', '07700100110',
    'DE66 FGH', 'Skoda', 'Octavia',
    now() - interval '34 days', now() - interval '33 days'
  ),
  (
    '01000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000038',
    'INV-2026-000005',
    'PAID',
    245.00, 0.00, 20.00, 49.00, 294.00,
    0.00, 294.00, now() - interval '41 days', now() - interval '40 days', null,
    'JOB-2026-000038', 'David Hughes', 'david.hughes@email.com', '07700100103',
    'PQ78 RST', 'BMW', '320d',
    now() - interval '41 days', now() - interval '40 days'
  ),
  (
    '01000000-0000-4000-8000-000000000006',
    'a1000000-0000-4000-8000-000000000043',
    'INV-2026-000006',
    'VOID',
    120.00, 0.00, 20.00, 24.00, 144.00,
    0.00, 0.00, now() - interval '12 days', null, now() - interval '10 days',
    'JOB-2026-000043', 'Nathan Collins', 'nathan.collins@email.com', '07700100111',
    'IJ77 KLM', 'Honda', 'Civic',
    now() - interval '12 days', now() - interval '10 days'
  );

-- Invoice lines (linked to work items where applicable)
insert into public.invoice_lines (id, invoice_id, source_work_item_id, kind, origin, description, quantity, unit_price, line_total, sort_order) values
  ('02000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000011', 'LABOUR', 'QUOTED', 'Interim service labour', 1.5, 55.00, 82.50, 1),
  ('02000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000012', 'PARTS', 'QUOTED', 'Oil and filter', 1, 42.00, 42.00, 2),
  ('02000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000013', 'LABOUR', 'QUOTED', 'Rear brake service labour', 1.5, 55.00, 82.50, 1),
  ('02000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000014', 'PARTS', 'QUOTED', 'Rear pads and hardware', 1, 68.00, 68.00, 2),
  ('02000000-0000-4000-8000-000000000005', '01000000-0000-4000-8000-000000000001', null, 'LABOUR', 'QUOTED', 'A/C regas labour', 1.0, 55.00, 55.00, 1),
  ('02000000-0000-4000-8000-000000000006', '01000000-0000-4000-8000-000000000001', null, 'MATERIALS', 'QUOTED', 'Refrigerant and dye', 1, 45.00, 45.00, 2);

-- Explicit invoice_number inserts do not advance invoice_number_seq (restarted
-- to 1 above). Align the sequence so the next default is max+1.
select setval(
  'public.invoice_number_seq',
  coalesce(
    (
      select max(substring(invoice_number from '([0-9]+)$')::bigint)
      from public.invoices
      where invoice_number ~ '[0-9]+$'
    ),
    1
  ),
  true
);

commit;

-- After running this seed:
-- 1. Link your Supabase Auth user to Sarah Mitchell (MANAGER):
--    update public.employees set user_id = '<your-auth-user-id>'
--    where id = 'e1000000-0000-4000-8000-000000000001';
-- 2. Set technician PINs through the app if you want to demo clock-in.
