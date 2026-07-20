using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RunStreak.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWeeklyGoalKm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "WeeklyGoalKm",
                table: "Users",
                type: "decimal(6,2)",
                nullable: false,
                defaultValue: 20.0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WeeklyGoalKm",
                table: "Users");
        }
    }
}
