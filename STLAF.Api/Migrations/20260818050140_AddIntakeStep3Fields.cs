using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIntakeStep3Fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "preferred_consultation_date",
                table: "intake_submissions");

            migrationBuilder.RenameColumn(
                name: "additional_notes",
                table: "intake_submissions",
                newName: "supporting_document_url");

            migrationBuilder.AddColumn<string>(
                name: "client_concerns",
                table: "intake_submissions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "consultation_date",
                table: "intake_submissions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "consultation_preference",
                table: "intake_submissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "how_did_you_find_us",
                table: "intake_submissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "preferred_time_slots",
                table: "intake_submissions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "supporting_document_file_name",
                table: "intake_submissions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "client_concerns",
                table: "intake_submissions");

            migrationBuilder.DropColumn(
                name: "consultation_date",
                table: "intake_submissions");

            migrationBuilder.DropColumn(
                name: "consultation_preference",
                table: "intake_submissions");

            migrationBuilder.DropColumn(
                name: "how_did_you_find_us",
                table: "intake_submissions");

            migrationBuilder.DropColumn(
                name: "preferred_time_slots",
                table: "intake_submissions");

            migrationBuilder.DropColumn(
                name: "supporting_document_file_name",
                table: "intake_submissions");

            migrationBuilder.RenameColumn(
                name: "supporting_document_url",
                table: "intake_submissions",
                newName: "additional_notes");

            migrationBuilder.AddColumn<DateTime>(
                name: "preferred_consultation_date",
                table: "intake_submissions",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
