using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddModuleAccessPositions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "department_access_positions");

            migrationBuilder.CreateTable(
                name: "module_access_positions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module = table.Column<string>(type: "text", nullable: false),
                    office_position = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_module_access_positions", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_module_access_positions_module_office_position",
                table: "module_access_positions",
                columns: new[] { "module", "office_position" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "module_access_positions");

            migrationBuilder.CreateTable(
                name: "department_access_positions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    department = table.Column<string>(type: "text", nullable: false),
                    office_position = table.Column<string>(type: "text", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department_access_positions", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_department_access_positions_department_office_position",
                table: "department_access_positions",
                columns: new[] { "department", "office_position" },
                unique: true);
        }
    }
}
