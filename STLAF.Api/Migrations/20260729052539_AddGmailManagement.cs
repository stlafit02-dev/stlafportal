using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGmailManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "gws_accounts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    max_capacity = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gws_accounts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "it_app_passwords",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    gws_account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    app_password = table.Column<string>(type: "text", nullable: false),
                    month = table.Column<int>(type: "integer", nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_it_app_passwords", x => x.id);
                    table.ForeignKey(
                        name: "FK_it_app_passwords_gws_accounts_gws_account_id",
                        column: x => x.gws_account_id,
                        principalTable: "gws_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "it_email_accounts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: false),
                    local_gmail = table.Column<string>(type: "text", nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    stlaf_email = table.Column<string>(type: "text", nullable: false),
                    old_user = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    gws_account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    remarks = table.Column<string>(type: "text", nullable: true),
                    deleted = table.Column<bool>(type: "boolean", nullable: false),
                    delete_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true),
                    old_stlaf_email = table.Column<string>(type: "text", nullable: true),
                    recycled = table.Column<bool>(type: "boolean", nullable: false),
                    recycled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_it_email_accounts", x => x.id);
                    table.ForeignKey(
                        name: "FK_it_email_accounts_gws_accounts_gws_account_id",
                        column: x => x.gws_account_id,
                        principalTable: "gws_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_it_app_passwords_gws_account_id",
                table: "it_app_passwords",
                column: "gws_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_it_email_accounts_gws_account_id",
                table: "it_email_accounts",
                column: "gws_account_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "it_app_passwords");

            migrationBuilder.DropTable(
                name: "it_email_accounts");

            migrationBuilder.DropTable(
                name: "gws_accounts");
        }
    }
}
