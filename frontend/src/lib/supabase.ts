import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hrqmnigkdjskmmgyjkvp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycW1uaWdrZGpza21tZ3lqa3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTg3NzcsImV4cCI6MjA4NzczNDc3N30.7jLTmoMNuHbWamg2Teg0SGYmmpSB3JXHaKkUlC1eKLw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
