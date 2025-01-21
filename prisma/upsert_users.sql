-- Create temporary table to hold CSV data
CREATE TEMP TABLE tmp_users (
    id TEXT,
    email TEXT,
    password TEXT,
    name TEXT,
    role TEXT,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);

-- Copy data from CSV file
\COPY tmp_users FROM 'prisma/user.csv' WITH (FORMAT csv, HEADER true);

-- Perform upsert operation
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
SELECT 
    COALESCE(t.id, gen_random_uuid()::text) as id,
    t.email,
    t.password,
    t.name,
    t.role::"Role",
    t."createdAt",
    t."updatedAt"
FROM tmp_users t
ON CONFLICT (email) 
DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role::"Role",
    "updatedAt" = EXCLUDED."updatedAt"
WHERE "User".email = EXCLUDED.email;

-- Clean up temporary table
DROP TABLE tmp_users;
