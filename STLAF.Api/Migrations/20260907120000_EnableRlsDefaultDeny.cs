using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    public partial class EnableRlsDefaultDeny : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
