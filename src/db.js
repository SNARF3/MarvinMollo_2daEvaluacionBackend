import pg from 'pg';

export const pool = new pg.Pool({
    user : "postgres.sxcatrssharoklkxkgyg",
    host : "aws-0-sa-east-1.pooler.supabase.com",
    password : "SnarfWithSisa2405",
    database : "sistg",
    port : "6543"
})