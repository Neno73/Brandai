import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function runMigration() {
  console.log('🔄 Connecting to Neon Postgres...')
  const sql = neon(DATABASE_URL)

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📝 Running migration...')

    // Split migration into individual statements (remove BEGIN/COMMIT and split by semicolon)
    const statements = migrationSQL
      .replace(/BEGIN;/g, '')
      .replace(/COMMIT;/g, '')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    // Execute each statement individually
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql(statement)
        } catch (err: any) {
          // Ignore "already exists" errors
          if (!err.message?.includes('already exists')) {
            throw err
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!')

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log('\n📊 Database tables:')
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`)
    })

    // Check seed data
    const products = await sql`SELECT name FROM products WHERE is_archived = FALSE`
    console.log('\n🎨 Seeded products:')
    products.forEach((product: any) => {
      console.log(`  - ${product.name}`)
    })

    console.log('\n🎉 Database is ready!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
