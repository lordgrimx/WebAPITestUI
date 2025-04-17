using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebTestUI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixJsonbColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ErrorDetails_Code",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorDetails_Message",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorDetails_Name",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorDetails_Stack",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Options_Duration",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Options_Vus",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_AverageResponseTime",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_ChecksRate",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Results_DetailedMetrics_DataReceived",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Results_DetailedMetrics_DataSent",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqDuration_Avg",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqDuration_Max",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqDuration_Med",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqDuration_Min",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqDuration_P90",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqDuration_P95",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqFailed",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_HttpReqRate",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_IterationDuration_Avg",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_IterationDuration_Max",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_IterationDuration_Med",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_IterationDuration_Min",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_IterationDuration_P90",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_IterationDuration_P95",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_DetailedMetrics_Iterations",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_DetailedMetrics_SuccessRate",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Results_Duration",
                table: "K6Tests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_FailureRate",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_P95ResponseTime",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Results_RequestsPerSecond",
                table: "K6Tests",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "Results_Timestamp",
                table: "K6Tests",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Results_Vus",
                table: "K6Tests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "K6TestLog",
                columns: table => new
                {
                    K6TestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<long>(type: "bigint", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Error_Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Error_Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Error_Stack = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Error_Code = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_K6TestLog", x => new { x.K6TestId, x.Id });
                    table.ForeignKey(
                        name: "FK_K6TestLog_K6Tests_K6TestId",
                        column: x => x.K6TestId,
                        principalTable: "K6Tests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "K6TestLog");

            migrationBuilder.DropColumn(
                name: "ErrorDetails_Code",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "ErrorDetails_Message",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "ErrorDetails_Name",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "ErrorDetails_Stack",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Options_Duration",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Options_Vus",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_AverageResponseTime",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_ChecksRate",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_DataReceived",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_DataSent",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqDuration_Avg",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqDuration_Max",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqDuration_Med",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqDuration_Min",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqDuration_P90",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqDuration_P95",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqFailed",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_HttpReqRate",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_IterationDuration_Avg",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_IterationDuration_Max",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_IterationDuration_Med",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_IterationDuration_Min",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_IterationDuration_P90",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_IterationDuration_P95",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_Iterations",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_DetailedMetrics_SuccessRate",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_Duration",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_FailureRate",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_P95ResponseTime",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_RequestsPerSecond",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_Timestamp",
                table: "K6Tests");

            migrationBuilder.DropColumn(
                name: "Results_Vus",
                table: "K6Tests");
        }
    }
}
