-- Migration: Add new block types (h1, h2, callout, link)
-- Run this AFTER 00001_zenflow_schema.sql if you already have data

-- Add new block types to enum
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'h1';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'h2';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'callout';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'link';

-- Note: IF NOT EXISTS is supported in PostgreSQL 9.5+
-- If you get an error, the types may already exist (that's OK)
