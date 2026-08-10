using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOvertimeModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hr_overtime_partners",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    department = table.Column<string>(type: "text", nullable: false),
                    partner_employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_overtime_partners", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_overtime_partners_hr_employees_partner_employee_id",
                        column: x => x.partner_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "hr_overtime_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    hours = table.Column<double>(type: "double precision", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    dept_decided_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    dept_decision_notes = table.Column<string>(type: "text", nullable: true),
                    dept_decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    partner_decided_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    partner_decision_notes = table.Column<string>(type: "text", nullable: true),
                    partner_decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_overtime_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_overtime_requests_hr_employees_dept_decided_by_employee_~",
                        column: x => x.dept_decided_by_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_hr_overtime_requests_hr_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_hr_overtime_requests_hr_employees_partner_decided_by_employ~",
                        column: x => x.partner_decided_by_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_hr_overtime_partners_department",
                table: "hr_overtime_partners",
                column: "department",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_hr_overtime_partners_partner_employee_id",
                table: "hr_overtime_partners",
                column: "partner_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_overtime_requests_dept_decided_by_employee_id",
                table: "hr_overtime_requests",
                column: "dept_decided_by_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_overtime_requests_employee_id",
                table: "hr_overtime_requests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_overtime_requests_partner_decided_by_employee_id",
                table: "hr_overtime_requests",
                column: "partner_decided_by_employee_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hr_overtime_partners");

            migrationBuilder.DropTable(
                name: "hr_overtime_requests");
        }
    }
}
