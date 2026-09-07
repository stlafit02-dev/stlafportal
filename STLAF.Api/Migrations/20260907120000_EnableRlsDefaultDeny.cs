using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnableRlsDefaultDeny : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Deny-by-default defense in depth: enable RLS with zero policies on every
            // public table. The API connects as the Supabase "postgres" role, which has
            // BYPASSRLS (confirmed via `SELECT rolbypassrls FROM pg_roles`), so this has
            // no effect on the API itself — it only blocks any other, non-bypassing role
            // (e.g. anon/authenticated via PostgREST, or a slip in the SQL editor).
            migrationBuilder.Sql(@"
                DO $$
                DECLARE r RECORD;
                BEGIN
                    FOR r IN
                        SELECT tablename FROM pg_tables
                        WHERE schemaname = 'public' AND tablename NOT IN ('__EFMigrationsHistory')
                    LOOP
                        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
                        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', r.tablename);
                    END LOOP;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                DECLARE r RECORD;
                BEGIN
                    FOR r IN
                        SELECT tablename FROM pg_tables
                        WHERE schemaname = 'public' AND tablename NOT IN ('__EFMigrationsHistory')
                    LOOP
                        EXECUTE format('ALTER TABLE public.%I NO FORCE ROW LEVEL SECURITY;', r.tablename);
                        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', r.tablename);
                    END LOOP;
                END $$;
            ");
        }
    }
}
