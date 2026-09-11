using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    public partial class RenamePlaceholderMapToFieldConfig : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "placeholder_map_json",
                table: "client_portal_document_templates",
                newName: "field_config_json");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "field_config_json",
                table: "client_portal_document_templates",
                newName: "placeholder_map_json");
        }
    }
}
