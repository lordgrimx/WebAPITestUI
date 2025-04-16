using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebTestUI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoLogoutEnabled",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CompactViewEnabled",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CrashReportsEnabled",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DateFormat",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "MarketingEmailsEnabled",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionTimeoutMinutes",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowSidebarEnabled",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Timezone",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "UsageAnalyticsEnabled",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoLogoutEnabled",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CompactViewEnabled",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CrashReportsEnabled",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DateFormat",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MarketingEmailsEnabled",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SessionTimeoutMinutes",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ShowSidebarEnabled",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Theme",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Timezone",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "UsageAnalyticsEnabled",
                table: "AspNetUsers");
        }
    }
}
