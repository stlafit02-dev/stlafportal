using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "document_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tracking_number = table.Column<string>(type: "text", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    note = table.Column<string>(type: "text", nullable: false),
                    document_link = table.Column<string>(type: "text", nullable: true),
                    file_object_key = table.Column<string>(type: "text", nullable: true),
                    file_url = table.Column<string>(type: "text", nullable: true),
                    file_name = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    ea_decided_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ea_decision_notes = table.Column<string>(type: "text", nullable: true),
                    ea_decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    partner_decided_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    partner_decision_notes = table.Column<string>(type: "text", nullable: true),
                    partner_decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_requests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document_reviewers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_reviewers", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_document_requests_tracking_number",
                table: "document_requests",
                column: "tracking_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_document_reviewers_role_employee_id",
                table: "document_reviewers",
                columns: new[] { "role", "employee_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "document_requests");

            migrationBuilder.DropTable(
                name: "document_reviewers");
        }
    }
}
