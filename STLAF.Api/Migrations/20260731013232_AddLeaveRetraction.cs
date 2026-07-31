using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveRetraction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "retraction_decided_at",
                table: "hr_leave_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "retraction_decided_by_employee_id",
                table: "hr_leave_requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "retraction_decision_notes",
                table: "hr_leave_requests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "retraction_reason",
                table: "hr_leave_requests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "retraction_requested_at",
                table: "hr_leave_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_hr_leave_requests_retraction_decided_by_employee_id",
                table: "hr_leave_requests",
                column: "retraction_decided_by_employee_id");

            migrationBuilder.AddForeignKey(
                name: "FK_hr_leave_requests_hr_employees_retraction_decided_by_employ~",
                table: "hr_leave_requests",
                column: "retraction_decided_by_employee_id",
                principalTable: "hr_employees",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_hr_leave_requests_hr_employees_retraction_decided_by_employ~",
                table: "hr_leave_requests");

            migrationBuilder.DropIndex(
                name: "IX_hr_leave_requests_retraction_decided_by_employee_id",
                table: "hr_leave_requests");

            migrationBuilder.DropColumn(
                name: "retraction_decided_at",
                table: "hr_leave_requests");

            migrationBuilder.DropColumn(
                name: "retraction_decided_by_employee_id",
                table: "hr_leave_requests");

            migrationBuilder.DropColumn(
                name: "retraction_decision_notes",
                table: "hr_leave_requests");

            migrationBuilder.DropColumn(
                name: "retraction_reason",
                table: "hr_leave_requests");

            migrationBuilder.DropColumn(
                name: "retraction_requested_at",
                table: "hr_leave_requests");
        }
    }
}
