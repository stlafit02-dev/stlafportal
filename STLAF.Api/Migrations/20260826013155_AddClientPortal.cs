using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientPortal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "client_accounts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_accounts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_admin_grants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_admin_grants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_services",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    category = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_services", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_voucher_codes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    plan_grants = table.Column<string>(type: "text", nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: true),
                    voucher_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_used = table.Column<bool>(type: "boolean", nullable: false),
                    redeemed_by_client_account_id = table.Column<Guid>(type: "uuid", nullable: true),
                    redeemed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_voucher_codes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_document_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_file_key = table.Column<string>(type: "text", nullable: false),
                    placeholder_map_json = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_document_templates", x => x.id);
                    table.ForeignKey(
                        name: "FK_client_portal_document_templates_client_portal_services_ser~",
                        column: x => x.service_id,
                        principalTable: "client_portal_services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_form_schemas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    fields_json = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_form_schemas", x => x.id);
                    table.ForeignKey(
                        name: "FK_client_portal_form_schemas_client_portal_services_service_id",
                        column: x => x.service_id,
                        principalTable: "client_portal_services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_submissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    form_schema_version = table.Column<int>(type: "integer", nullable: false),
                    responses_json = table.Column<string>(type: "jsonb", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_submissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_client_portal_submissions_client_accounts_client_account_id",
                        column: x => x.client_account_id,
                        principalTable: "client_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_client_portal_submissions_client_portal_services_service_id",
                        column: x => x.service_id,
                        principalTable: "client_portal_services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    activated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    voucher_code_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "FK_client_portal_subscriptions_client_accounts_client_account_~",
                        column: x => x.client_account_id,
                        principalTable: "client_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_client_portal_subscriptions_client_portal_voucher_codes_vou~",
                        column: x => x.voucher_code_id,
                        principalTable: "client_portal_voucher_codes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "client_portal_generated_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    submission_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_key = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_portal_generated_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_client_portal_generated_documents_client_portal_submissions~",
                        column: x => x.submission_id,
                        principalTable: "client_portal_submissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_client_accounts_email",
                table: "client_accounts",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_admin_grants_user_id",
                table: "client_portal_admin_grants",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_document_templates_service_id",
                table: "client_portal_document_templates",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_form_schemas_service_id_version",
                table: "client_portal_form_schemas",
                columns: new[] { "service_id", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_generated_documents_submission_id",
                table: "client_portal_generated_documents",
                column: "submission_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_submissions_client_account_id",
                table: "client_portal_submissions",
                column: "client_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_submissions_service_id",
                table: "client_portal_submissions",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_subscriptions_client_account_id",
                table: "client_portal_subscriptions",
                column: "client_account_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_subscriptions_voucher_code_id",
                table: "client_portal_subscriptions",
                column: "voucher_code_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_portal_voucher_codes_code",
                table: "client_portal_voucher_codes",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "client_portal_admin_grants");

            migrationBuilder.DropTable(
                name: "client_portal_document_templates");

            migrationBuilder.DropTable(
                name: "client_portal_form_schemas");

            migrationBuilder.DropTable(
                name: "client_portal_generated_documents");

            migrationBuilder.DropTable(
                name: "client_portal_subscriptions");

            migrationBuilder.DropTable(
                name: "client_portal_submissions");

            migrationBuilder.DropTable(
                name: "client_portal_voucher_codes");

            migrationBuilder.DropTable(
                name: "client_accounts");

            migrationBuilder.DropTable(
                name: "client_portal_services");
        }
    }
}
