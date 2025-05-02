using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebTestUI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSupportAndChatEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.CreateTable(
            //     name: "AspNetRoles",
            //     columns: table => new
            //     {
            //         Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
            //         Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
            //         NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
            //         ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_AspNetRoles", x => x.Id);
            //     });
            //
            // migrationBuilder.CreateTable(
            //     name: "AspNetUsers",
            //     columns: table => new
            //     {
            //         Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
            //         Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         ProfileImageBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
            //         TwoFactorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         TwoFactorCodeExpiry = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         Language = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Timezone = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         DateFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         AutoLogoutEnabled = table.Column<bool>(type: "bit", nullable: true),
            //         SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: true),
            //         Theme = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         CompactViewEnabled = table.Column<bool>(type: "bit", nullable: true),
            //         ShowSidebarEnabled = table.Column<bool>(type: "bit", nullable: true),
            //         UsageAnalyticsEnabled = table.Column<bool>(type: "bit", nullable: true),
            //         CrashReportsEnabled = table.Column<bool>(type: "bit", nullable: true),
            //         MarketingEmailsEnabled = table.Column<bool>(type: "bit", nullable: true),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
            //         UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
            //         NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
            //         Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
            //         NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
            //         EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
            //         PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
            //         LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
            //         LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
            //         AccessFailedCount = table.Column<int>(type: "int", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_AspNetUsers", x => x.Id);
            //     });

            migrationBuilder.CreateTable(
                name: "Faqs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Question = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Faqs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HelpDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HelpDocuments", x => x.Id);
                });

            // migrationBuilder.CreateTable(
            //     name: "K6Tests",
            //     columns: table => new
            //     {
            //         Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //         Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Script = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         AuthType = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         AuthToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Options_Vus = table.Column<int>(type: "int", nullable: true),
            //         Options_Duration = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         ErrorDetails_Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         ErrorDetails_Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         ErrorDetails_Stack = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         ErrorDetails_Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         RequestId = table.Column<int>(type: "int", nullable: true),
            //         Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         Results_Vus = table.Column<int>(type: "int", nullable: true),
            //         Results_Duration = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Results_RequestsPerSecond = table.Column<double>(type: "float", nullable: true),
            //         Results_FailureRate = table.Column<double>(type: "float", nullable: true),
            //         Results_AverageResponseTime = table.Column<double>(type: "float", nullable: true),
            //         Results_P95ResponseTime = table.Column<double>(type: "float", nullable: true),
            //         Results_Timestamp = table.Column<long>(type: "bigint", nullable: true),
            //         Results_DetailedMetrics_ChecksRate = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_DataReceived = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Results_DetailedMetrics_DataSent = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Results_DetailedMetrics_HttpReqRate = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_HttpReqFailed = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_SuccessRate = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_Iterations = table.Column<int>(type: "int", nullable: true),
            //         Results_DetailedMetrics_HttpReqDuration_Avg = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_HttpReqDuration_Min = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_HttpReqDuration_Med = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_HttpReqDuration_Max = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_HttpReqDuration_P90 = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_HttpReqDuration_P95 = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_IterationDuration_Avg = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_IterationDuration_Min = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_IterationDuration_Med = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_IterationDuration_Max = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_IterationDuration_P90 = table.Column<double>(type: "float", nullable: true),
            //         Results_DetailedMetrics_IterationDuration_P95 = table.Column<double>(type: "float", nullable: true),
            //         Results_StatusCodes_Status200 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status201 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status204 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status400 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status401 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status403 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status404 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status415 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Status500 = table.Column<int>(type: "int", nullable: true),
            //         Results_StatusCodes_Other = table.Column<int>(type: "int", nullable: true),
            //         CreatedAt = table.Column<long>(type: "bigint", nullable: false),
            //         UpdatedAt = table.Column<long>(type: "bigint", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_K6Tests", x => x.Id);
            //     });

            migrationBuilder.CreateTable(
                name: "SupportTickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTickets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SupportTicketReplies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsFromSupport = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTicketReplies", x => x.Id);
                    // table.ForeignKey(
                    //     name: "FK_SupportTicketReplies_SupportTickets_TicketId",
                    //     column: x => x.TicketId,
                    //     principalTable: "SupportTickets",
                    //     principalColumn: "Id",
                    //     onDelete: ReferentialAction.Cascade);
                    // Assuming FK constraint to AspNetUsers might exist, but commenting it out as the table is commented.
                    // table.ForeignKey(
                    //     name: "FK_SupportTicketReplies_AspNetUsers_UserId",
                    //     column: x => x.UserId,
                    //     principalTable: "AspNetUsers",
                    //     principalColumn: "Id",
                    //     onDelete: ReferentialAction.Restrict); // Changed from Cascade to Restrict or NoAction if needed
                });

            // migrationBuilder.CreateTable(
            //     name: "Requests",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
            //         CollectionId = table.Column<int>(type: "int", nullable: true),
            //         EnvironmentId = table.Column<int>(type: "int", nullable: true),
            //         Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Method = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Headers = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         AuthType = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         AuthConfig = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Params = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Tests = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         IsFavorite = table.Column<bool>(type: "bit", nullable: false),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_Requests", x => x.Id);
            //         // Assuming FK constraints might exist, but commenting them out as related tables are commented.
            //         // table.ForeignKey(
            //         //     name: "FK_Requests_AspNetUsers_UserId",
            //         //     column: x => x.UserId,
            //         //     principalTable: "AspNetUsers",
            //         //     principalColumn: "Id",
            //         //     onDelete: ReferentialAction.Cascade);
            //         // table.ForeignKey(
            //         //     name: "FK_Requests_Collections_CollectionId",
            //         //     column: x => x.CollectionId,
            //         //     principalTable: "Collections",
            //         //     principalColumn: "Id");
            //         // table.ForeignKey(
            //         //     name: "FK_Requests_Environments_EnvironmentId",
            //         //     column: x => x.EnvironmentId,
            //         //     principalTable: "Environments",
            //         //     principalColumn: "Id");
            //     });

            // migrationBuilder.CreateTable(
            //     name: "SharedData",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
            //         Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
            //         IsSensitive = table.Column<bool>(type: "bit", nullable: false),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_SharedData", x => x.Id);
            //     });

            // migrationBuilder.CreateTable(
            //     name: "SupportTickets",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
            //         Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
            //         Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
            //         Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //         Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //         CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_SupportTickets", x => x.Id);
            //         // Assuming FK constraint to AspNetUsers might exist, but commenting it out as the table is commented.
            //         // table.ForeignKey(
            //         //     name: "FK_SupportTickets_AspNetUsers_UserId",
            //         //     column: x => x.UserId,
            //         //     principalTable: "AspNetUsers",
            //         //     principalColumn: "Id",
            //         //     onDelete: ReferentialAction.Cascade);
            //     });
            // ... rest of the Up method ...
            // migrationBuilder.CreateTable(
            //     name: "HistoryEntries",
            //     columns: table => new
            //     {
            //         Id = table.Column<int>(type: "int", nullable: false)
            //             .Annotation("SqlServer:Identity", "1, 1"),
            //         UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
            //         RequestId = table.Column<int>(type: "int", nullable: true),
            //         EnvironmentId = table.Column<int>(type: "int", nullable: true),
            //         Method = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
            //         Status = table.Column<int>(type: "int", nullable: true),
            //         Duration = table.Column<int>(type: "int", nullable: true),
            //         ResponseSize = table.Column<int>(type: "int", nullable: true),
            //         Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
            //         Response = table.Column<string>(type: "nvarchar(max)", nullable: true)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_HistoryEntries", x => x.Id);
            //         // Assuming FK constraints might exist, but commenting them out as related tables are commented.
            //         // table.ForeignKey(
            //         //     name: "FK_HistoryEntries_AspNetUsers_UserId",
            //         //     column: x => x.UserId,
            //         //     principalTable: "AspNetUsers",
            //         //     principalColumn: "Id");
            //         // table.ForeignKey(
            //         //     name: "FK_HistoryEntries_Environments_EnvironmentId",
            //         //     column: x => x.EnvironmentId,
            //         //     principalTable: "Environments",
            //         //     principalColumn: "Id");
            //         // table.ForeignKey(
            //         //     name: "FK_HistoryEntries_Requests_RequestId",
            //         //     column: x => x.RequestId,
            //         //     principalTable: "Requests",
            //         //     principalColumn: "Id");            //     });

            // migrationBuilder.CreateIndex(
            //     name: "IX_AspNetUserClaims_UserId",
            //     table: "AspNetUserClaims",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_AspNetUserLogins_UserId",
            //     table: "AspNetUserLogins",        //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_AspNetUserRoles_RoleId",
            //     table: "AspNetUserRoles",
            //     column: "RoleId");

            // migrationBuilder.CreateIndex(
            //     name: "EmailIndex",
            //     table: "AspNetUsers",
            //     column: "NormalizedEmail");

            // migrationBuilder.CreateIndex(
            //     name: "UserNameIndex",
            //     table: "AspNetUsers",
            //     column: "NormalizedUserName",
            //     unique: true,
            //     filter: "[NormalizedUserName] IS NOT NULL");

            // migrationBuilder.CreateIndex(
            //     name: "IX_AspNetUserClaims_UserId", // Already commented out
            //     table: "AspNetUserClaims",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_AspNetUserLogins_UserId", // Duplicate removed/commented
            //     table: "AspNetUserLogins",
            //     column: "UserId");            // migrationBuilder.CreateIndex(
            //     name: "IX_ChatMessages_UserId",
            //     table: "ChatMessages",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Collections_EnvironmentId",
            //     table: "Collections",
            //     column: "EnvironmentId");            // migrationBuilder.CreateIndex(
            //     name: "IX_Collections_UserId",
            //     table: "Collections",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Environments_UserId",
            //     table: "Environments",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_HistoryEntries_EnvironmentId",
            //     table: "HistoryEntries",
            //     column: "EnvironmentId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_HistoryEntries_RequestId",
            //     table: "HistoryEntries",
            //     column: "RequestId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_HistoryEntries_UserId",
            //     table: "HistoryEntries",
            //     column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Requests_CollectionId",
            //     table: "Requests",
            //     column: "CollectionId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_Requests_EnvironmentId",
            //     table: "Requests",
            //     column: "EnvironmentId");            // migrationBuilder.CreateIndex(
            //     name: "IX_Requests_UserId",
            //     table: "Requests",
            //     column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketReplies_TicketId",
                table: "SupportTicketReplies",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketReplies_UserId",
                table: "SupportTicketReplies",
                column: "UserId");

            // migrationBuilder.CreateIndex(
            //     name: "IX_SupportTickets_UserId",
            //     table: "SupportTickets",
            //     column: "UserId");
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
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "Faqs");

            migrationBuilder.DropTable(
                name: "HelpDocuments");

            migrationBuilder.DropTable(
                name: "HistoryEntries");

            migrationBuilder.DropTable(
                name: "K6TestLog");

            migrationBuilder.DropTable(
                name: "SharedData");

            migrationBuilder.DropTable(
                name: "SupportTicketReplies");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Requests");

            migrationBuilder.DropTable(
                name: "K6Tests");

            migrationBuilder.DropTable(
                name: "SupportTickets");

            migrationBuilder.DropTable(
                name: "Collections");

            migrationBuilder.DropTable(
                name: "Environments");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
