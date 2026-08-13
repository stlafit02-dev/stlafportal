using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeEmergencyContact : Migration
    {
        /// <inheritdoc />
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

        /// <inheritdoc />
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
