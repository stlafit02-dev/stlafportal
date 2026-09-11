using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkFormSchemaToDocumentTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_client_portal_form_schemas_client_portal_services_service_id",
                table: "client_portal_form_schemas");

            migrationBuilder.RenameColumn(
                name: "service_id",
                table: "client_portal_form_schemas",
                newName: "document_template_id");

            migrationBuilder.RenameIndex(
                name: "IX_client_portal_form_schemas_service_id_version",
                table: "client_portal_form_schemas",
                newName: "IX_client_portal_form_schemas_document_template_id_version");

            // At this point document_template_id still holds the old service_id values (the
            // rename above only changed the column name). Backfill real template ids before
            // adding the FK below:
            //  - a service with no template at all can no longer be represented (a form now
            //    always belongs to a template), so those rows are dropped;
            //  - otherwise each form version is paired with whichever template was live for
            //    its service at the time it was saved (falling back to that service's
            //    earliest template if the form predates every template).
            migrationBuilder.Sql(@"
                DELETE FROM client_portal_form_schemas
                WHERE document_template_id NOT IN (
                    SELECT service_id FROM client_portal_document_templates
                );

                UPDATE client_portal_form_schemas fs
                SET document_template_id = COALESCE(
                    (SELECT dt.id FROM client_portal_document_templates dt
                     WHERE dt.service_id = fs.document_template_id AND dt.created_at <= fs.created_at
                     ORDER BY dt.created_at DESC LIMIT 1),
                    (SELECT dt.id FROM client_portal_document_templates dt
                     WHERE dt.service_id = fs.document_template_id
                     ORDER BY dt.created_at ASC LIMIT 1)
                );
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_client_portal_form_schemas_client_portal_document_templates~",
                table: "client_portal_form_schemas",
                column: "document_template_id",
                principalTable: "client_portal_document_templates",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_client_portal_form_schemas_client_portal_document_templates~",
                table: "client_portal_form_schemas");

            migrationBuilder.Sql(@"
                UPDATE client_portal_form_schemas fs
                SET document_template_id = dt.service_id
                FROM client_portal_document_templates dt
                WHERE dt.id = fs.document_template_id;
            ");

            migrationBuilder.RenameColumn(
                name: "document_template_id",
                table: "client_portal_form_schemas",
                newName: "service_id");

            migrationBuilder.RenameIndex(
                name: "IX_client_portal_form_schemas_document_template_id_version",
                table: "client_portal_form_schemas",
                newName: "IX_client_portal_form_schemas_service_id_version");

            migrationBuilder.AddForeignKey(
                name: "FK_client_portal_form_schemas_client_portal_services_service_id",
                table: "client_portal_form_schemas",
                column: "service_id",
                principalTable: "client_portal_services",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
