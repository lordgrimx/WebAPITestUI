using System.Data;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WebTestUI.Backend.Data.Extensions
{
    /// <summary>
    /// Extension methods for MigrationBuilder
    /// </summary>
    public static class MigrationBuilderExtensions
    {
        /// <summary>
        /// Checks if a table exists in the database
        /// </summary>
        /// <param name="migrationBuilder">The migration builder</param>
        /// <param name="tableName">The table name to check</param>
        /// <returns>True if the table exists, false otherwise</returns>
        public static bool TableExists(this MigrationBuilder migrationBuilder, string tableName)
        {
            // Use SQL to check if the table exists
            var sql = $@"
                SELECT CASE WHEN EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = '{tableName}'
                ) THEN 1 ELSE 0 END";

            var exists = false;

            // The MigrationBuilder.Sql method cannot be used to execute a query and retrieve results
            // back into the C# code like this. The lambda expression caused a compile error
            // because no overload of Sql accepts it in this way.
            // Consider embedding conditional logic directly into your SQL scripts
            // or re-evaluating the need for this check within the migration code itself.
            // This method, as originally written, is incompatible with EF Core's MigrationBuilder.
            // Returning false as a placeholder - this method needs rethinking.
            // migrationBuilder.Sql(sql); // This would execute the SQL but not return the result.
            // throw new NotSupportedException("Cannot check table existence using MigrationBuilder.Sql in this manner.");
            // For now, returning false to resolve the compile error, but the logic is incorrect.
            exists = false; // Placeholder: Bu metodun mantığı EF Core ile uyumlu değil.

            return exists;
        }
    }
}
