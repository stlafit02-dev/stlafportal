using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUndertimeAndMedicalCertificates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "requires_medical_after_days",
                table: "hr_leave_types",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "hr_medical_certificates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    leave_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    drive_file_id = table.Column<string>(type: "text", nullable: true),
                    drive_file_url = table.Column<string>(type: "text", nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verified_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    verification_notes = table.Column<string>(type: "text", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_medical_certificates", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_medical_certificates_hr_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_hr_medical_certificates_hr_employees_verified_by_employee_id",
                        column: x => x.verified_by_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_hr_medical_certificates_hr_leave_requests_leave_request_id",
                        column: x => x.leave_request_id,
                        principalTable: "hr_leave_requests",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "hr_undertime_requests",
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
                    decided_by_employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    decision_notes = table.Column<string>(type: "text", nullable: true),
                    decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hr_undertime_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_hr_undertime_requests_hr_employees_decided_by_employee_id",
                        column: x => x.decided_by_employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_hr_undertime_requests_hr_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "hr_employees",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_hr_medical_certificates_employee_id",
                table: "hr_medical_certificates",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_medical_certificates_leave_request_id",
                table: "hr_medical_certificates",
                column: "leave_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_medical_certificates_verified_by_employee_id",
                table: "hr_medical_certificates",
                column: "verified_by_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_undertime_requests_decided_by_employee_id",
                table: "hr_undertime_requests",
                column: "decided_by_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_hr_undertime_requests_employee_id",
                table: "hr_undertime_requests",
                column: "employee_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hr_medical_certificates");

            migrationBuilder.DropTable(
                name: "hr_undertime_requests");

            migrationBuilder.DropColumn(
                name: "requires_medical_after_days",
                table: "hr_leave_types");
        }
    }
}
