using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STLAF.Api.Migrations
{
    public partial class AddLoginLockout : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "failed_login_attempts",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "lockout_end",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "failed_login_attempts",
                table: "users");

            migrationBuilder.DropColumn(
                name: "lockout_end",
                table: "users");
        }
    }
}
