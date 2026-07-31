using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSmtpSenders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_hr_leave_notification_settings_it_email_accounts_email_acco~",
                table: "hr_leave_notification_settings");

            migrationBuilder.RenameColumn(
                name: "email_account_id",
                table: "hr_leave_notification_settings",
                newName: "smtp_sender_id");

            migrationBuilder.RenameIndex(
                name: "IX_hr_leave_notification_settings_email_account_id",
                table: "hr_leave_notification_settings",
                newName: "IX_hr_leave_notification_settings_smtp_sender_id");

            migrationBuilder.CreateTable(
                name: "smtp_senders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    app_password = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_smtp_senders", x => x.id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_hr_leave_notification_settings_smtp_senders_smtp_sender_id",
                table: "hr_leave_notification_settings",
                column: "smtp_sender_id",
                principalTable: "smtp_senders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_hr_leave_notification_settings_smtp_senders_smtp_sender_id",
                table: "hr_leave_notification_settings");

            migrationBuilder.DropTable(
                name: "smtp_senders");

            migrationBuilder.RenameColumn(
                name: "smtp_sender_id",
                table: "hr_leave_notification_settings",
                newName: "email_account_id");

            migrationBuilder.RenameIndex(
                name: "IX_hr_leave_notification_settings_smtp_sender_id",
                table: "hr_leave_notification_settings",
                newName: "IX_hr_leave_notification_settings_email_account_id");

            migrationBuilder.AddForeignKey(
                name: "FK_hr_leave_notification_settings_it_email_accounts_email_acco~",
                table: "hr_leave_notification_settings",
                column: "email_account_id",
                principalTable: "it_email_accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
