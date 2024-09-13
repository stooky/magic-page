-- Ensure the database "mp" exists
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mp') THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE mp');
    END IF;
END
$$;

-- Connect to the "mp" database
\connect mp

-- Set up the table and schema in the "mp" database

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Remove the default tablespace setting as it causes issues
-- SET default_tablespace = 'mp'; -- Removed this line

SET default_table_access_method = heap;

-- Create the table "websitevisitors"
CREATE TABLE IF NOT EXISTS public.websitevisitors (
    sessionid text NOT NULL,
    email text,
    website text,
    companyname text,
    mylistingurl text
);

-- Set the owner of the table
ALTER TABLE public.websitevisitors OWNER TO postgres;

-- Add the primary key constraint, but first check if it exists
DO
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'websitevisitors_pkey') THEN
        ALTER TABLE public.websitevisitors
        ADD CONSTRAINT websitevisitors_pkey PRIMARY KEY (sessionid);
    END IF;
END
$$;
