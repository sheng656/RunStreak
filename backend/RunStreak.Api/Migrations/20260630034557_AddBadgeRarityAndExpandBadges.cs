using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RunStreak.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBadgeRarityAndExpandBadges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Rarity",
                table: "Badges",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "common");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rarity",
                table: "Badges");
        }
    }
}
