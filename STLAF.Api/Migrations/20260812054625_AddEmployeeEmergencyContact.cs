using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    public partial class AddEmployeeEmergencyContact : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_name",
                table: "hr_employees",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_number",
                table: "hr_employees",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "emergency_contact_name",
                table: "hr_employees");

            migrationBuilder.DropColumn(
                name: "emergency_contact_number",
                table: "hr_employees");
        }
    }
}
