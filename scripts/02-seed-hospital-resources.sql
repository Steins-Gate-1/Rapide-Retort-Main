-- Seed hospital resources data

INSERT INTO hospital_resources (resource_type, resource_name, total_capacity, current_usage, status, location) VALUES
-- Emergency Department Resources
('bed', 'Emergency Beds', 25, 18, 'available', 'Emergency Department'),
('bed', 'ICU Beds', 12, 8, 'available', 'Intensive Care Unit'),
('bed', 'General Ward Beds', 50, 32, 'available', 'General Ward'),
('bed', 'Pediatric Beds', 15, 6, 'available', 'Pediatric Ward'),

-- Medical Equipment
('equipment', 'Ventilators', 8, 5, 'available', 'ICU/Emergency'),
('equipment', 'Defibrillators', 6, 2, 'available', 'Emergency Department'),
('equipment', 'ECG Machines', 4, 1, 'available', 'Emergency Department'),
('equipment', 'X-Ray Machines', 2, 1, 'available', 'Radiology'),
('equipment', 'CT Scanner', 1, 0, 'available', 'Radiology'),
('equipment', 'Ultrasound Machines', 3, 1, 'available', 'Emergency Department'),

-- Medical Staff
('staff', 'Emergency Physicians', 6, 4, 'available', 'Emergency Department'),
('staff', 'Nurses', 20, 15, 'available', 'Hospital Wide'),
('staff', 'Specialists', 8, 3, 'available', 'Various Departments'),
('staff', 'Technicians', 10, 6, 'available', 'Various Departments'),

-- Medications and Supplies
('medication', 'Epinephrine', 50, 12, 'available', 'Pharmacy'),
('medication', 'Morphine', 30, 8, 'available', 'Pharmacy'),
('medication', 'Insulin', 40, 15, 'available', 'Pharmacy'),
('medication', 'Antibiotics', 100, 25, 'available', 'Pharmacy'),
('supply', 'IV Fluids', 200, 45, 'available', 'Supply Room'),
('supply', 'Oxygen Tanks', 25, 8, 'available', 'Supply Room');
