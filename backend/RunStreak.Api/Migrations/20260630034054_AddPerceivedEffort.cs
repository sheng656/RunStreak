using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RunStreak.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPerceivedEffort : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PerceivedEffort",
                table: "Runs",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PerceivedEffort",
                table: "Runs");
        }
    }
}
