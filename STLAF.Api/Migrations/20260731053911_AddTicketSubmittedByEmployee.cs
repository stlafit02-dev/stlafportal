using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    public partial class AddTicketSubmittedByEmployee : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "submitted_by_employee_id",
                table: "it_tickets",
                type: "uuid",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "submitted_by_employee_id",
                table: "it_tickets");
        }
    }
}
