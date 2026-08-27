using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenamePlaceholderMapToFieldConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "placeholder_map_json",
                table: "client_portal_document_templates",
                newName: "field_config_json");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "field_config_json",
                table: "client_portal_document_templates",
                newName: "placeholder_map_json");
        }
    }
}
