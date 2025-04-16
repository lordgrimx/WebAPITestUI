using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebTestUI.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileImageBase64 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ProfileImage",
                table: "AspNetUsers",
                newName: "ProfileImageBase64");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ProfileImageBase64",
                table: "AspNetUsers",
                newName: "ProfileImage");
        }
    }
}
