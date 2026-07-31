using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hr_leave_approvers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    department = table.Column<string>(type: "text", nullable: false),
                    approver_employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_leave_approvers", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_leave_approvers_hr_employees_approver_employee_id",
                        column: x => x.approver_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hr_leave_notification_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email_account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_leave_notification_settings", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_leave_notification_settings_it_email_accounts_email_acco~",
                        column: x => x.email_account_id,
                        principalTable: "it_email_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hr_leave_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    default_credits = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_leave_types", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "hr_leave_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    leave_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    days = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    decided_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    decision_notes = table.Column<string>(type: "text", nullable: true),
                    decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_leave_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_leave_requests_hr_employees_decided_by_employee_id",
                        column: x => x.decided_by_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_hr_leave_requests_hr_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_hr_leave_requests_hr_leave_types_leave_type_id",
                        column: x => x.leave_type_id,
                        principalTable: "hr_leave_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_approvers_approver_employee_id",
                table: "hr_leave_approvers",
                column: "approver_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_approvers_department",
                table: "hr_leave_approvers",
                column: "department",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_notification_settings_email_account_id",
                table: "hr_leave_notification_settings",
                column: "email_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_requests_decided_by_employee_id",
                table: "hr_leave_requests",
                column: "decided_by_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_requests_employee_id",
                table: "hr_leave_requests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_requests_leave_type_id",
                table: "hr_leave_requests",
                column: "leave_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hr_leave_approvers");

            migrationBuilder.DropTable(
                name: "hr_leave_notification_settings");

            migrationBuilder.DropTable(
                name: "hr_leave_requests");

            migrationBuilder.DropTable(
                name: "hr_leave_types");
        }
    }
}
