/**
 * Creates (or upserts) an admin user in Supabase Auth so the dashboard's
 * password login works without going through Supabase Dashboard manually.
 *
 * Run:   npm run seed-admin
 * Or:    netlify dev:exec tsx scripts/seed-admin.ts
 *
 * Override email/password via env if you don't want the defaults:
 *   ADMIN_EMAIL=...  ADMIN_PASSWORD=...  npm run seed-admin
 */

import { createClient } from '@supabase/supabase-js'

const url =
  process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing env vars. Need:')
  console.error('  - NEXT_PUBLIC_SUPABASE_DATABASE_URL (or SUPABASE_DATABASE_URL)')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Run with: npm run seed-admin (or `netlify dev:exec tsx scripts/seed-admin.ts`)')
  process.exit(1)
}

const email = process.env.ADMIN_EMAIL || 'admin@example.com'
const password = process.env.ADMIN_PASSWORD || 'tgfacip'

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  // Check if the user already exists.
  const { data: existing, error: lookupError } = await supabase.auth.admin.listUsers()
  if (lookupError) {
    console.error('Failed to list users:', lookupError.message)
    process.exit(1)
  }

  const found = existing.users.find((u) => u.email === email)

  if (found) {
    // Update password (and confirm email if it wasn't already).
    const { error: updateError } = await supabase.auth.admin.updateUserById(found.id, {
      password,
      email_confirm: true,
    })
    if (updateError) {
      console.error('Failed to update existing user:', updateError.message)
      process.exit(1)
    }
    console.log(`✓ Updated existing admin: ${email}`)
  } else {
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createError) {
      console.error('Failed to create user:', createError.message)
      process.exit(1)
    }
    console.log(`✓ Created admin: ${email}`)
  }

  console.log('')
  console.log(`Sign in at /login with:`)
  console.log(`  email:    ${email}`)
  console.log(`  password: ${password}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
