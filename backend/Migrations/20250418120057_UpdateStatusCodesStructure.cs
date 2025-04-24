using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebTestUI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStatusCodesStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Other",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status200",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status201",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status204",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status400",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status401",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status403",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status404",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status415",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_StatusCodes_Status500",
                table: "K6Tests",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Other",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status200",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status201",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status204",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status400",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status401",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status403",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status404",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status415",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_StatusCodes_Status500",
                table: "K6Tests");
        }
    }
}
