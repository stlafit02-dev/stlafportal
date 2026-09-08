using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentRequestPartnerArchive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_archived_by_partner",
                table: "document_requests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "partner_archived_at",
                table: "document_requests",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_archived_by_partner",
                table: "document_requests");

            migrationBuilder.DropColumn(
                name: "partner_archived_at",
                table: "document_requests");
        }
    }
}
