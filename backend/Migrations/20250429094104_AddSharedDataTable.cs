using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebTestUI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSharedDataTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            /* Identity tabloları zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfileImageBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TwoFactorCodeExpiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Timezone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AutoLogoutEnabled = table.Column<bool>(type: "bit", nullable: true),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: true),
                    Theme = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompactViewEnabled = table.Column<bool>(type: "bit", nullable: true),
                    ShowSidebarEnabled = table.Column<bool>(type: "bit", nullable: true),
                    UsageAnalyticsEnabled = table.Column<bool>(type: "bit", nullable: true),
                    CrashReportsEnabled = table.Column<bool>(type: "bit", nullable: true),
                    MarketingEmailsEnabled = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });
            */

            /* K6Tests tablosu zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateTable(
                name: "K6Tests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Script = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AuthType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Options_Vus = table.Column<int>(type: "int", nullable: true),
                    Options_Duration = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ErrorDetails_Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ErrorDetails_Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ErrorDetails_Stack = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ErrorDetails_Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Results_Vus = table.Column<int>(type: "int", nullable: true),
                    Results_Duration = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Results_RequestsPerSecond = table.Column<double>(type: "float", nullable: true),
                    Results_FailureRate = table.Column<double>(type: "float", nullable: true),
                    Results_AverageResponseTime = table.Column<double>(type: "float", nullable: true),
                    Results_P95ResponseTime = table.Column<double>(type: "float", nullable: true),
                    Results_Timestamp = table.Column<long>(type: "bigint", nullable: true),
                    Results_DetailedMetrics_ChecksRate = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_DataReceived = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Results_DetailedMetrics_DataSent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Results_DetailedMetrics_HttpReqRate = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_HttpReqFailed = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_SuccessRate = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_Iterations = table.Column<int>(type: "int", nullable: true),
                    Results_DetailedMetrics_HttpReqDuration_Avg = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_HttpReqDuration_Min = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_HttpReqDuration_Med = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_HttpReqDuration_Max = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_HttpReqDuration_P90 = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_HttpReqDuration_P95 = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_IterationDuration_Avg = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_IterationDuration_Min = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_IterationDuration_Med = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_IterationDuration_Max = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_IterationDuration_P90 = table.Column<double>(type: "float", nullable: true),
                    Results_DetailedMetrics_IterationDuration_P95 = table.Column<double>(type: "float", nullable: true),
                    Results_StatusCodes_Status200 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status201 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status204 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status400 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status401 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status403 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status404 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status415 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Status500 = table.Column<int>(type: "int", nullable: true),
                    Results_StatusCodes_Other = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedAt = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_K6Tests", x => x.Id);
                });
            */

            migrationBuilder.CreateTable(
                name: "SharedData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShareId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedData", x => x.Id);
                });

            /* Identity tabloları zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            */

            /* Diğer uygulama tabloları zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateTable(
                name: "Environments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Variables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Environments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Environments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateTable(
                name: "Collections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnvironmentId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Collections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Collections_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Collections_Environments_EnvironmentId",
                        column: x => x.EnvironmentId,
                        principalTable: "Environments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Requests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CollectionId = table.Column<int>(type: "int", nullable: true),
                    EnvironmentId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Method = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Headers = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Params = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tests = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsFavorite = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Requests_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Requests_Collections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "Collections",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Requests_Environments_EnvironmentId",
                        column: x => x.EnvironmentId,
                        principalTable: "Environments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "HistoryEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RequestId = table.Column<int>(type: "int", nullable: true),
                    EnvironmentId = table.Column<int>(type: "int", nullable: true),
                    Method = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: true),
                    Duration = table.Column<int>(type: "int", nullable: true),
                    ResponseSize = table.Column<int>(type: "int", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Response = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoryEntries_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_HistoryEntries_Environments_EnvironmentId",
                        column: x => x.EnvironmentId,
                        principalTable: "Environments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_HistoryEntries_Requests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "Requests",
                        principalColumn: "Id");
                });
            */

            /* Identity tabloları zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");
            */

            /* Diğer uygulama tabloları zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateIndex(
                name: "IX_Collections_EnvironmentId",
                table: "Collections",
                column: "EnvironmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Collections_UserId",
                table: "Collections",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Environments_UserId",
                table: "Environments",
                column: "UserId");
            */

            /* Diğer uygulama tabloları zaten var, bu yüzden yorum satırı yapıldı.
            migrationBuilder.CreateIndex(
                name: "IX_HistoryEntries_EnvironmentId",
                table: "HistoryEntries",
                column: "EnvironmentId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryEntries_RequestId",
                table: "HistoryEntries",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryEntries_UserId",
                table: "HistoryEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_CollectionId",
                table: "Requests",
                column: "CollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_EnvironmentId",
                table: "Requests",
                column: "EnvironmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_UserId",
                table: "Requests",
                column: "UserId");
            */
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "HistoryEntries");

            migrationBuilder.DropTable(
                name: "K6TestLog");

            migrationBuilder.DropTable(
                name: "SharedData");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Requests");

            migrationBuilder.DropTable(
                name: "K6Tests");

            migrationBuilder.DropTable(
                name: "Collections");

            migrationBuilder.DropTable(
                name: "Environments");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
