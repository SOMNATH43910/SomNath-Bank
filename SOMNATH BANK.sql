USE somnath_bank;

-- Yeh query sab tables aur unke columns count karega
SELECT 
    TABLE_NAME AS 'Table',
    COUNT(*) AS 'Rows'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'somnath_bank'
GROUP BY TABLE_NAME;

USE somnath_bank;

UPDATE users 
SET password = '$2a$10$slYQmyNdgzRecKviHo6KluCiDkBIGAkIxFpvMDdLnxH4DGDqzFHxS'
WHERE email = 'somnath@somnathbank.com';

SELECT email, is_active, role FROM users 
WHERE email = 'somnath@somnathbank.com';

-- is_active = 1 hona chahiye
-- role = ADMIN hona chahiye

USE somnath_bank;

SELECT id, full_name, email, password, role, is_active 
FROM users 
WHERE email = 'somnath@somnathbank.com';

USE somnath_bank;

UPDATE users 
SET password = '$2a$10$jvGmvw32O6h4AizGvSkDfOCUaWJtF1B93eHO1aMEFOri6rWJR9ojG'
WHERE email = 'somnath@somnathbank.com';

-- Account approve
UPDATE users 
SET is_active = 1 
WHERE email = 'rahul@gmail.com';

USE somnath_bank;

SELECT l.id, l.user_id, l.account_id, 
       u.full_name, u.email
FROM loans l
JOIN users u ON l.user_id = u.id;

-- Pehle sab users dekho
SELECT id, full_name, email FROM users;


-- Loan ka user fix karo
UPDATE loans 
SET user_id = 2
WHERE id = 1;

-- Verify karo
SELECT l.id, u.full_name, u.email, 
       l.loan_amount, l.status
FROM loans l
JOIN users u ON l.user_id = u.id;

UPDATE loans 
SET user_id = 2
WHERE id = 1;


-- Account approve
UPDATE users 
SET is_active = 3
WHERE email = 'priya@gmail.com';


-- Account approve
UPDATE users 
SET is_active = 4
WHERE email = 'mbhowmick772@gmail.com';


UPDATE users 
SET is_active = 1 
WHERE email IN ('rahul@gmail.com', 'mbhowick772@gmail.com');


SELECT email, is_active FROM users;

UPDATE users 
SET is_active = 1 
WHERE email = 'priya@gmail.com';

ALTER TABLE notifications 
MODIFY COLUMN type ENUM(
    'ACCOUNT',
    'TRANSACTION', 
    'LOAN',
    'CARD',
    'FD',
    'INFO',
    'SUCCESS',
    'WARNING',
    'ALERT'
);

UPDATE users 
SET is_active = 1 
WHERE email = 'subha123@gmail.com';


USE somnath_bank;
DELETE FROM transactions;

SET SQL_SAFE_UPDATES = 0;
DELETE FROM transactions;
SET SQL_SAFE_UPDATES = 1;
DELETE FROM transactions WHERE id > 0;

DELETE FROM loans WHERE id > 0;